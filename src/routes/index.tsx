import { createHashRouter } from "react-router-dom";
import { MainLayout } from "@/components/ui/layout/Mainlayout";

// Import your pages
import { Dashboard } from "@/pages/dashboard/main";
import TransactionsPage from "@/pages/Transactions/main";
const Insights = () => <div className="p-8">Insights Page</div>;
const Budgets = () => <div className="p-8">cool Page</div>;

export const router = createHashRouter([
  {
    path: "/",
    element: <MainLayout />, // The shell
    children: [
      { index: true, element: <Dashboard /> }, // Renders at "/"
      { path: "transactions", element: <TransactionsPage /> },
      { path: "insights", element: <Insights /> },
      { path: "budgets", element: <Budgets /> },
    ],
  },
]);