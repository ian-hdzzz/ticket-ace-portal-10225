import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { PageProvider, usePageContext } from "@/contexts/PageContext";

function DashboardContent() {
  const { title, description } = usePageContext();
  // Recuperar usuario y rol de la sesión
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const fullName = user?.full_name || "";
  const [role, setRole] = useState("");
  useEffect(() => {
    async function fetchRole() {
      if (!user?.id) return;
      // 1. Obtener el role_id de users_roles
      const { data: userRole, error: userRoleError } = await supabase
        .from('users_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .single();
      if (!userRole?.role_id) {
        setRole("");
        return;
      }
      // 2. Obtener el nombre del rol desde la tabla roles
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', userRole.role_id)
        .single();
      setRole(roleData?.name || "");
    }
    fetchRole();
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

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 flex h-20 flex-shrink-0 items-center justify-between gap-6 border-b bg-background px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              {/* Mensaje de bienvenida y rol */}
              {fullName && (
                <div className="flex flex-col items-start">
                  <span className="font-bold text-primary leading-tight" style={{ fontSize: '1.3rem' }}>
                    ¡Bienvenido {fullName}!
                  </span>
                  <span className="text-sm mt-0.5" style={{ color: '#4B5563' }}>
                    Rol: {role || "Sin rol"}
                  </span>
                </div>
              )}
            </div>
            
            {/* Título y descripción de la sección */}
            {(title || description) && (
              <div className="flex flex-col items-end text-right">
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
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
            <Outlet />
          </main>
        </div>
        {chatwootReady && (
          <Button
            className="fixed bottom-8 right-8 h-12 w-12 rounded-full"
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
