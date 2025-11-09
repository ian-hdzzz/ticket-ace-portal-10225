import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

export function DashboardLayout() {
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
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1" />
          </header>
          <main className="flex-1 p-6">
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
