use crate::model::{MonthlyBalance, Transaction};
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
                tx.tx_type, // uses ToSql impl
                tx.amount.to_string(),
                tx.category, // uses ToSql impl
                tx.description.as_deref(),
                tx.date.format("%Y-%m-%d").to_string(),
            ],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get_all_transactions(&self) -> Result<Vec<Transaction>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, tx_type, amount, category, description, date
             FROM transactions ORDER BY date DESC",
        )?;
        let rows = stmt.query_map([], Self::map_row)?;
        rows.map(|r| r.map_err(anyhow::Error::from)).collect()
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
        rows.map(|r| r.map_err(anyhow::Error::from)).collect()
    }

    pub fn get_balance(&self) -> Result<Decimal> {
        let conn = self.conn.lock().unwrap();
        let balance_str: String = conn.query_row(
            "SELECT COALESCE(SUM(CASE WHEN tx_type = 'income' THEN CAST(amount AS REAL) ELSE 0 END), 0) -
                    COALESCE(SUM(CASE WHEN tx_type = 'expense' THEN CAST(amount AS REAL) ELSE 0 END), 0)
             FROM transactions",
            [],
            |row| row.get::<_, String>(0),
        )?;
        Ok(Decimal::from_str(&balance_str)?)
    }

    pub fn delete_transaction(&self, id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let rows_affected = conn.execute("DELETE FROM transactions WHERE id = ?1", [id])?;
        if rows_affected == 0 {
            return Err(anyhow::anyhow!("No transaction found with id {}", id));
        }
        Ok(())
    }

    pub fn get_monthly_balance(&self, year: i32) -> Result<Vec<MonthlyBalance>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT
                strftime('%Y-%m', date) as year_month,
                COALESCE(SUM(CASE WHEN tx_type = 'income' THEN CAST(amount AS REAL) ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN tx_type = 'expense' THEN CAST(amount AS REAL) ELSE 0 END), 0) as total_expense
             FROM transactions
             WHERE strftime('%Y', date) = ?1
             GROUP BY year_month
             ORDER BY year_month ASC",
        )?;

        let result: Vec<MonthlyBalance> = stmt
            .query_map([year.to_string()], |row| {
                let income_f64: f64 = row.get("total_income")?;
                let expense_f64: f64 = row.get("total_expense")?;
                Ok(MonthlyBalance {
                    month: row.get("year_month")?,
                    income: Decimal::try_from(income_f64).unwrap_or_default(),
                    expense: Decimal::try_from(expense_f64).unwrap_or_default(),
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        // Fill missing months so the chart always shows 12 data points
        let full_year = (1..=12)
            .map(|m| {
                let month_str = format!("{:04}-{:02}", year, m);
                result
                    .iter()
                    .find(|r| r.month == month_str)
                    .cloned()
                    .unwrap_or(MonthlyBalance {
                        month: month_str,
                        income: Decimal::ZERO,
                        expense: Decimal::ZERO,
                    })
            })
            .collect();

        Ok(full_year)
    }

    fn map_row(row: &Row) -> rusqlite::Result<Transaction> {
        let date_str: String = row.get("date")?;
        let date = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
            .map_err(|_| rusqlite::Error::InvalidQuery)?;

        Ok(Transaction {
            id: Some(row.get("id")?),
            tx_type: row.get("tx_type")?, // uses FromSql impl
            amount: {
                let s: String = row.get("amount")?;
                Decimal::from_str(&s).map_err(|_| rusqlite::Error::InvalidQuery)?
            },
            category: row.get("category")?, // uses FromSql impl
            description: row.get("description")?,
            date,
        })
    }
}
