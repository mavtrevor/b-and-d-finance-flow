
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function AuthenticatedLayout() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-b-green-500" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  // Default sidebar state: open on desktop, closed on mobile
  const defaultSidebarState = !isMobile;

  return (
    <SidebarProvider defaultOpen={defaultSidebarState}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 overflow-auto md:ml-[16rem] transition-all duration-300 ease-in-out">
          <div className="p-4 md:p-6">
            <div className="md:hidden mb-4">
              <SidebarTrigger className="mr-4" />
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
