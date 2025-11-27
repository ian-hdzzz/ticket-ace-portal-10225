import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Admin from "./components/layout/Admin";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetails from "./pages/TicketDetails";
import CreateTicket from "./pages/CreateTicket";
import Agents from "./pages/Agents";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ChatwootWidget from "./components/features/ChatwootWidget";
import Auth from "./pages/Auth";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ChatwootWidget />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="tickets/new" element={<CreateTicket />} />
              <Route path="tickets/:id" element={<TicketDetails />} />
              <Route path="agents" element={<Agents />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin" element={<Admin />} />
            </Route>
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
