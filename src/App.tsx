
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/SupabaseAuthContext";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Settings } from "@/pages/Settings";
import { Income } from "@/pages/Income";
import { Expenses } from "@/pages/Expenses";
import { Withdrawals } from "@/pages/Withdrawals";
import { Reports } from "@/pages/Reports";
import { PartnerBalances } from "@/pages/PartnerBalances";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="max-w-screen-2xl mx-auto">
          <Routes>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Authentication routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={<AuthenticatedLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="income" element={<Income />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="withdrawals" element={<Withdrawals />} />
              <Route path="reports" element={<Reports />} />
              <Route path="partner-balances" element={<PartnerBalances />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Not found route */}
            <Route path="*" element={<div className="p-4">Page Not Found</div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
