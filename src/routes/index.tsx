import { createHashRouter } from "react-router-dom";
import { MainLayout } from "@/components/ui/layout/Mainlayout";

// Import your pages
import { Dashboard } from "@/pages/dashboard/main";
const Insights = () => <div className="p-8">Insights Page</div>;
const Budgets = () => <div className="p-8">cool Page</div>;

export const router = createHashRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "insights", element: <Insights /> },
      { path: "budgets", element: <Budgets /> },
    ],
  },
]);
