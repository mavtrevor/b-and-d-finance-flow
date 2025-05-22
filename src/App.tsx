
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/SupabaseAuthContext";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Authentication routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/" element={<AuthenticatedLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="income" element={<div className="p-4">Income Page (Coming Soon)</div>} />
            <Route path="expenses" element={<div className="p-4">Expenses Page (Coming Soon)</div>} />
            <Route path="withdrawals" element={<div className="p-4">Withdrawals Page (Coming Soon)</div>} />
            <Route path="reports" element={<div className="p-4">Reports Page (Coming Soon)</div>} />
            <Route path="partner-balances" element={<div className="p-4">Partner Balances (Coming Soon)</div>} />
            <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
          </Route>
          
          {/* Not found route */}
          <Route path="*" element={<div className="p-4">Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
