import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProfileBuilder from "./pages/ProfileBuilder";
import PublicProfile from "./pages/PublicProfile";
import Dashboard from "./pages/Dashboard";
import GoogleCallback from "./pages/auth/GoogleCallback";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Sites from "./pages/Sites";
import Settings from "./pages/Settings";
import Professionals from "./pages/Professionals";
import BusinessCardPage from "./pages/BusinessCardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/p/:slug" element={<PublicProfile />} />
          <Route path="/professionals" element={<Professionals />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile-builder" element={<ProfileBuilder />} />
              <Route path="/sites" element={<Sites />} />
              <Route path="/cards" element={<BusinessCardPage />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
