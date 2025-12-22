import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { PageProvider, usePageContext } from "@/contexts/PageContext";
import { NotificationWidget } from "@/components/NotificationWidget";
import { agentService, type AgentStatus } from "@/services/agent.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CUSTOMER_SERVICE_ROLE_ID = 'ca0b30c6-b73d-4cbb-bc04-490f4280b4b1';

function DashboardContent() {
  const { title, description } = usePageContext();
  // Recuperar usuario y rol de la sesión
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const fullName = user?.full_name || "";
  const [role, setRole] = useState("");
  const [roleId, setRoleId] = useState("");
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('offline');
  const [isAgent, setIsAgent] = useState(false);

  useEffect(() => {
    async function fetchRoleAndAgent() {
      if (!user?.id) return;
      
      // 1. Obtener el role_id de users_roles
      const { data: userRole } = await supabase
        .from('users_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .single();
      
      if (!userRole?.role_id) {
        setRole("");
        setRoleId("");
        return;
      }
      
      setRoleId(userRole.role_id);
      
      // 2. Obtener el nombre del rol desde la tabla roles
      const { data: roleData } = await supabase
        .from('roles')
        .select('name')
        .eq('id', userRole.role_id)
        .single();
      
      setRole(roleData?.name || "");
      
      // 3. Check if user is customer service agent
      if (userRole.role_id === CUSTOMER_SERVICE_ROLE_ID) {
        setIsAgent(true);
        
        // 4. Get agent status
        const agent = await agentService.getAgentByUserId(user.id);
        if (agent) {
          setAgentStatus(agent.status);
        }
      }
    }
    fetchRoleAndAgent();
  }, [user]);
  const [chatwootReady, setChatwootReady] = useState(false);

  useEffect(() => {
    const checkChatwoot = () => {
      if (window.$chatwoot) {
        setChatwootReady(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkChatwoot()) return;

    // Listen for the ready event
    const handleChatwootReady = () => {
      checkChatwoot();
    };

    window.addEventListener('chatwoot:ready', handleChatwootReady);

    // Also poll as a fallback
    const interval = setInterval(() => {
      if (checkChatwoot()) {
        clearInterval(interval);
      }
    }, 100);

    return () => {
      window.removeEventListener('chatwoot:ready', handleChatwootReady);
      clearInterval(interval);
    };
  }, []);

  const handleChatwootToggle = () => {
    if (window.$chatwoot) {
      window.$chatwoot.toggle();
    }
  };

  const handleStatusChange = async (newStatus: AgentStatus) => {
    if (!user?.id) return;
    
    const success = await agentService.updateAgentStatus(user.id, newStatus);
    if (success) {
      setAgentStatus(newStatus);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 flex h-20 flex-shrink-0 items-center justify-between gap-6 border-b bg-background px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              {/* Título y descripción de la sección */}
              {(title || description) && (
                <div className="flex flex-col items-start">
                  {title && (
                    <h1 className="text-2xl font-bold tracking-tight text-primary">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Mensaje de bienvenida, rol y estado */}
            {fullName && (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end text-right">
                  <span className="font-bold text-black leading-tight" style={{ fontSize: '1.3rem' }}>
                    ¡Bienvenido <span className="text-primary">{fullName}!</span>
                  </span>
                  <span className="text-sm mt-0.5" style={{ color: '#00409aff' }}>
                    Rol: {role || "Sin rol"}
                  </span>
                </div>
                
                {/* Status dropdown for customer service agents */}
                {isAgent && (
                  <Select value={agentStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Activo
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          Inactivo
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
            <Outlet />
          </main>
        </div>
        
        {/* Widget de notificaciones - only for customer service agents */}
        {isAgent && <NotificationWidget />}
        
        {chatwootReady && (
          <Button
            className="fixed bottom-24 right-8 h-12 w-12 rounded-full"
            onClick={handleChatwootToggle}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        )}
      </div>
    </SidebarProvider>
  );
}

export function DashboardLayout() {
  return (
    <PageProvider>
      <DashboardContent />
    </PageProvider>
  );
}
