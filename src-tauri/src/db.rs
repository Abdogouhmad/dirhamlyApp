use crate::model::{MonthlyBalance, Transaction, TxType};
use anyhow::Result;
use chrono::NaiveDate;
use rusqlite::{Connection, Row};
use rust_decimal::Decimal;
use std::str::FromStr;
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct DiBase {
    conn: Arc<Mutex<Connection>>,
}

impl DiBase {
    pub fn new<P: AsRef<std::path::Path>>(db_path: P) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }
    pub fn initialize(&self) -> Result<()> {
        // TODO: consider to use index on date for archive tables
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "CREATE TABLE IF NOT EXISTS transactions (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                tx_type     TEXT NOT NULL CHECK(tx_type IN ('income', 'expense')),
                amount      TEXT NOT NULL,
                category    TEXT NOT NULL,
                description TEXT,
                date        TEXT NOT NULL
            )",
            [],
        )?;
        Ok(())
    }
    pub fn add_transaction(&self, tx: &Transaction) -> Result<i64> {
        let conn = self.conn.lock().unwrap();

        conn.execute(
            "INSERT INTO transactions (tx_type, amount, category, description, date)
         VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![
                tx.tx_type.to_string(),
                tx.amount.to_string(),
                tx.category,
                tx.description.as_deref(),
                tx.date.format("%Y-%m-%d").to_string(),
            ],
        )?;

        // ✅ Safe, works everywhere
        let id = conn.last_insert_rowid();

        Ok(id)
    }
    pub fn get_all_transactions(&self) -> Result<Vec<Transaction>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, tx_type, amount, category, description, date
             FROM transactions ORDER BY date DESC",
        )?;

        let rows = stmt.query_map([], Self::map_row)?;

        let mut txs = Vec::new();
        for row in rows {
            txs.push(row?);
        }
        Ok(txs)
    }

    pub fn get_transactions_by_month(&self, year_month: &str) -> Result<Vec<Transaction>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, tx_type, amount, category, description, date
             FROM transactions
             WHERE date LIKE ?1
             ORDER BY date DESC",
        )?;

        let pattern = format!("{}%", year_month);
        let rows = stmt.query_map([pattern], Self::map_row)?;

        let mut txs = Vec::new();
        for row in rows {
            txs.push(row?);
        }
        Ok(txs)
    }

    pub fn get_balance(&self) -> Result<Decimal> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT COALESCE(SUM(CASE WHEN tx_type = 'income' THEN amount ELSE '0' END), '0') -
                    COALESCE(SUM(CASE WHEN tx_type = 'expense' THEN amount ELSE '0' END), '0')
             FROM transactions",
        )?;

        let balance_str: String = stmt.query_row([], |row| row.get(0))?;
        let balance = Decimal::from_str(&balance_str)?;
        Ok(balance)
    }

    pub fn delete_transaction(&self, id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        let rows_affected = conn.execute("DELETE FROM transactions WHERE id = ?1", [id])?;

        if rows_affected == 0 {
            return Err(anyhow::anyhow!("No transaction found with id {}", id));
        }

        println!("Deleted transaction with id: {}", id);
        Ok(())
    }

    pub fn get_monthly_balance(&self, year: i32) -> Result<Vec<MonthlyBalance>> {
        let conn = self.conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT 
        strftime('%Y-%m', date) as year_month,
        COALESCE(SUM(CASE WHEN tx_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN tx_type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
     FROM transactions 
     WHERE strftime('%Y', date) = ?1
     GROUP BY year_month
     ORDER BY year_month ASC",
        )?;

        let rows = stmt.query_map([year.to_string()], |row| {
            // Get as f64 directly since SQLite REAL → f64 is native
            let income_f64: f64 = row.get("total_income")?;
            let expense_f64: f64 = row.get("total_expense")?;

            Ok(MonthlyBalance {
                month: row.get("year_month")?,
                income: Decimal::try_from(income_f64).unwrap_or_default(),
                expense: Decimal::try_from(expense_f64).unwrap_or_default(),
            })
        })?;

        let mut result = Vec::new();
        for row in rows {
            result.push(row?);
        }

        // Fill missing months with 0 (so chart always shows 12 months)
        let mut full_year = vec![];
        for m in 1..=12 {
            let month_str = format!("{:04}-{:02}", year, m);
            if let Some(existing) = result.iter().find(|r| r.month == month_str) {
                full_year.push(existing.clone());
            } else {
                full_year.push(MonthlyBalance {
                    month: month_str,
                    income: Decimal::ZERO,
                    expense: Decimal::ZERO,
                });
            }
        }

        Ok(full_year)
    }

    fn map_row(row: &Row) -> rusqlite::Result<Transaction> {
        let id: i64 = row.get("id")?;
        let tx_type_str: String = row.get("tx_type")?;
        let amount_str: String = row.get("amount")?;
        let category: String = row.get("category")?;
        let description: Option<String> = row.get("description")?;
        let date_str: String = row.get("date")?;

        let tx_type =
            TxType::try_from(tx_type_str.as_str()).map_err(|_| rusqlite::Error::InvalidQuery)?;

        let amount = Decimal::from_str(&amount_str).map_err(|_| rusqlite::Error::InvalidQuery)?;

        let date = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
            .map_err(|_| rusqlite::Error::InvalidQuery)?;

        Ok(Transaction {
            id: Some(id),
            tx_type,
            amount,
            category,
            description,
            date,
        })
    }
}
