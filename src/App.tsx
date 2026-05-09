// src/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import "./App.css";
import { ProfileProvider, useProfile } from "@/lib/ProfileContext";
import { Onboarding } from "@/pages/onboarding/main";
import { RefreshCw } from "lucide-react";

const AppContent = () => {
  const { profile, loading, refreshProfile } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-cobalt-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <Onboarding onComplete={refreshProfile} />;
  }

  return <RouterProvider router={router} />;
};

const App = () => {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  );
};

export default App;