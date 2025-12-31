import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Settings,
  Droplet,
  Bot,
  User,
  LogOut,
  FileText,
  BarChart3,
  Headset,
  ClipboardList,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import authService from "@/services/auth.service";
import { agentService } from "@/services/agent.service";

const CUSTOMER_SERVICE_ROLE_ID = 'ca0b30c6-b73d-4cbb-bc04-490f4280b4b1';

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Tickets", url: "/dashboard/tickets", icon: Ticket },
  { title: "Órdenes", url: "/dashboard/ordenes", icon: ClipboardList },
  { title: "Servicio a Cliente", url: "/dashboard/servicio-cliente", icon: Headset },
  { title: "Reportes", url: "/dashboard/crear-reportes", icon: BarChart3 },
  { title: "Contratos", url: "/dashboard/contratos", icon: FileText },
  { title: "Agentes IA", url: "/dashboard/agents", icon: Bot },
  { title: "Admin", url: "/dashboard/admin", icon: User },
  { title: "Configuración", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    // Para el Dashboard, solo activo si es exactamente /dashboard
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    // Para otras rutas, activo si la ruta actual comienza con la ruta del item
    return currentPath.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      // Check if user is customer service agent and set status to inactive
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const isCustomerServiceAgent = user.roles?.some(
            (role: any) => role.id === CUSTOMER_SERVICE_ROLE_ID
          );
          
          if (isCustomerServiceAgent && user.id) {
            await agentService.setAgentInactive(user.id);
          }
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
        }
      }
      
      await authService.logout();
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
      // Clear local data even if API call fails
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Droplet className="h-6 w-6 text-white" />
          </div>
          {state !== "collapsed" && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">CEA Querétaro</h2>
              <p className="text-xs text-sidebar-foreground/70">Sistema de Tickets</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Botón de cerrar sesión al fondo del sidebar, con diseño tipo Configuración */}
        <div className="mt-auto px-4 pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 py-2 px-3 rounded-lg bg-[#181E29] text-[#bfcbe7] font-semibold hover:bg-[#232B3E] transition border border-[#232B3E] justify-start"
          >
            <LogOut className="h-5 w-5 text-[#bfcbe7]" />
            <span className="text-base">Cerrar sesión</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
