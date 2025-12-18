import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Admin from "./components/layout/Admin";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetails from "./pages/TicketDetails";
import CreateTicket from "./pages/CreateTicket";
import { TabProvider } from "./contexts/TabContext";
import { TicketsWithTabs } from "./components/TicketsWithTabs";
import CrearReportes from "./pages/CrearReportes";
import Contratos from "./pages/Contratos";
import ContratoDetail from "./pages/ContratoDetail";
import Lecturas from "./pages/Lecturas";
import Deuda from "./pages/Deuda";
import Agents from "./pages/Agents";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ChatwootWidget from "./components/features/ChatwootWidget";
import Auth from "./pages/Auth";
import ApiTest from "./pages/ApiTest";
import RootRedirect from "./pages/RootRedirect";
const queryClient = new QueryClient();
import TestPermissions from "./pages/TestPermissions";


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TabProvider>
        <Toaster />
        <Sonner />
        <ChatwootWidget />
        <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<RootRedirect />} />
          <Route element={<RequireAuth />}>
            <Route path="/test-permissions" element={<TestPermissions />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Dashboard - Requiere acceso al dashboard */}
              <Route 
                index 
                element={
                  <ProtectedRoute 
                    requiredPermissions={["acceso_dashboard", "view_dashboard"]}
                    fallbackPath="/dashboard/tickets"
                  >
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Tickets - Requiere permiso de ver tickets */}
              <Route 
                path="tickets" 
                element={
                  <ProtectedRoute requiredPermissions={["ver_tickets", "view_tickets"]}>
                    <TicketsWithTabs />
                  </ProtectedRoute>
                } 
              />
              
              {/* Crear Ticket - Requiere permiso de crear ticket */}
              <Route 
                path="tickets/new" 
                element={
                  <ProtectedRoute requiredPermissions={["crear_ticket", "create_ticket"]}>
                    <CreateTicket />
                  </ProtectedRoute>
                } 
              />
              
              {/* Crear Reportes - Requiere permiso de generar reportes */}
              <Route 
                path="crear-reportes" 
                element={
                  <ProtectedRoute requiredPermissions={["generar_reportes", "generate_reports"]}>
                    <CrearReportes />
                  </ProtectedRoute>
                } 
              />
              
              {/* Detalles de Ticket - Requiere permiso de ver tickets */}
              <Route 
                path="tickets/:id" 
                element={
                  <ProtectedRoute requiredPermissions={["ver_tickets", "view_tickets"]}>
                    <TicketDetails />
                  </ProtectedRoute>
                } 
              />
              
              {/* Contratos - Requiere permiso de ver contratos */}
              <Route 
                path="contratos" 
                element={
                  <ProtectedRoute requiredPermissions={["ver_numero_contratos", "view_contracts"]}>
                    <Contratos />
                  </ProtectedRoute>
                } 
              />
              
              {/* Detalles de Contrato */}
              <Route 
                path="contratos/detail/:contratoId" 
                element={
                  <ProtectedRoute requiredPermissions={["view_contract_details", "ver_numero_contratos"]}>
                    <ContratoDetail />
                  </ProtectedRoute>
                } 
              />
              
              {/* Lecturas - Requiere permiso de ver lecturas */}
              <Route 
                path="lecturas/:contratoId/:explotacion" 
                element={
                  <ProtectedRoute requiredPermissions={["ver_lecturas", "view_readings"]}>
                    <Lecturas />
                  </ProtectedRoute>
                } 
              />
              
              {/* Deuda - Requiere permiso de ver deuda */}
              <Route 
                path="deuda/:contratoId/:explotacion" 
                element={
                  <ProtectedRoute requiredPermissions={["ver_deuda", "view_debt"]}>
                    <Deuda />
                  </ProtectedRoute>
                } 
              />
              
              {/* Agentes - Requiere permiso de gestionar agentes */}
              <Route 
                path="agents" 
                element={
                  <ProtectedRoute requiredPermissions={["manage_agents", "crear_agente", "editar_agente"]}>
                    <Agents />
                  </ProtectedRoute>
                } 
              />
              
              {/* Configuración - Requiere permiso de ver configuración */}
              <Route 
                path="settings" 
                element={
                  <ProtectedRoute requiredPermissions={["view_settings", "acceso_dashboard"]}>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin - Requiere permiso de acceso al panel de administración */}
              <Route 
                path="admin" 
                element={
                  <ProtectedRoute requiredPermissions={["access_admin_panel", "asignar_roles", "editar_info_usuario"]}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TabProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
