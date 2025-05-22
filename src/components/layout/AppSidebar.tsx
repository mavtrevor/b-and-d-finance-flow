
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Wallet, ArrowDownLeft, ArrowUpRight, FileText, Users, Settings } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, setIsOpen } = useSidebar();

  // Close sidebar on navigation for mobile devices
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, setIsOpen]);

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/dashboard",
    },
    {
      title: "Income",
      icon: ArrowDownLeft,
      path: "/income",
    },
    {
      title: "Expenses",
      icon: ArrowUpRight,
      path: "/expenses",
    },
    {
      title: "Withdrawals",
      icon: Wallet,
      path: "/withdrawals",
    },
    {
      title: "Reports",
      icon: FileText,
      path: "/reports",
    },
    {
      title: "Partner Balances",
      icon: Users,
      path: "/partner-balances",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close sidebar after navigation on mobile
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex items-center p-4">
          <h1 className="text-xl font-semibold text-sidebar-foreground">B&D Apartments</h1>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground opacity-70">MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    className={
                      location.pathname === item.path
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : ""
                    }
                    onClick={() => handleNavigation(item.path)}
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
            onClick={() => signOut()}
          >
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
