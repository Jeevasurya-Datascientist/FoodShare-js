import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SecurityWaitwall from '@/components/SecurityWaitwall';

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AuthAction from "./pages/AuthAction";
import DonorDashboard from "./pages/DonorDashboard";
import NGODashboard from "./pages/NGODashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddDonation from "./pages/AddDonation";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

import Leaderboard from "./pages/Leaderboard";
import RecipeGenerator from "./pages/RecipeGenerator";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import DataUse from "./pages/DataUse";

import { useEffect } from "react";
import { BRANDING } from "@/constants/branding";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    console.info(
      `%c ${BRANDING.FRAMEWORK_NAME} Initialized `,
      'background: #000; color: #fff; padding: 4px; border-radius: 4px; font-weight: bold;'
    );
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <SecurityWaitwall>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/action" element={<AuthAction />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route
                  path="/donor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['donor']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor/add-donation"
                  element={
                    <ProtectedRoute allowedRoles={['donor']}>
                      <AddDonation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ngo/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ngo']}>
                      <NGODashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['volunteer']}>
                      <VolunteerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['donor', 'ngo', 'volunteer']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <Leaderboard />
                  }
                />
                <Route path="/recipes" element={<RecipeGenerator />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/data-use" element={<DataUse />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SecurityWaitwall>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider >
  );
};

export default App;
