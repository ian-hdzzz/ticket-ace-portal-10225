import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Ticket as TicketIcon, User } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listTickets, createTicket } from "@/api/tickets";
import { listAgents } from "@/api/agents";
import type { Ticket, UserType, ContactChannel, AssignmentGroup } from "@/types/entities";
import { mapStatus, mapPriority, mapPriorityToApi, mapChannel, mapAssignmentGroup } from "@/lib/mappers";
import { getVisibleFields, FIELD_LABELS, getUserTypeDisplayName, type TicketField } from "@/lib/fieldVisibility";
import { allUserTypes } from "@/lib/userTypes";
import { supabase } from '../supabase/client.ts'

export default function Tickets() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [priorityFilter, setPriorityFilter] = useState<string>("todos");
  const [selectedUserType, setSelectedUserType] = useState<UserType>("admin");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [supabaseTickets, setSupabaseTickets] = useState<any[]>([]);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  const [newTicket, setNewTicket] = useState<{
    descripcion_breve: string;
    titular: string;
    canal: ContactChannel;
    estado: "open" | "in_progress" | "resolved" | "closed";
    prioridad: "low" | "medium" | "high" | "urgent";
    grupo_asignacion: AssignmentGroup;
    asignado_a: string | null;
    numero_reporte_cea_app?: string;
    numero_contrato?: string;
    colonia?: string;
    direccion?: string;
    observaciones_internas?: string;
    administracion?: string;
    numero_orden_aquacis?: string;
  }>({
    descripcion_breve: "",
    titular: "",
    canal: "telefono",
    estado: "open",
    prioridad: "medium",
    grupo_asignacion: "atencion_cliente",
    asignado_a: null,
  });

  // Comentamos temporalmente la query original para usar Supabase
  // const { data: ticketsData, isLoading } = useQuery({
  //   queryKey: ["tickets"],
  //   queryFn: listTickets,
  // });

  const { data: agentsData } = useQuery({
    queryKey: ["agents"],
    queryFn: listAgents,
  });

  const queryClient = useQueryClient();

  // Get visible fields for the selected user type
  const visibleFields = useMemo(() => getVisibleFields(selectedUserType), [selectedUserType]);

  const filteredTickets = useMemo(() => {
    if (!supabaseTickets) return [];
    
    return supabaseTickets.filter((ticket) => {
      const matchesSearch =
        (ticket.numero_ticket?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (ticket.descripcion_breve?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (ticket.titular?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      const matchesStatus = statusFilter === "todos" || ticket.estado === statusFilter;
      const matchesPriority = priorityFilter === "todos" || ticket.prioridad === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [supabaseTickets, searchQuery, statusFilter, priorityFilter]);
  // Función mejorada para traer datos del backend
  const getTickets = async () => {
    setIsLoadingSupabase(true);
    try {
      // Obtener tickets con datos de clientes si existe tabla separada
      const result = await supabase
        .from('tickets')
        .select(`
          *,
          customer:customer_id (
            id,
            name,
            full_name,
            nombre,
            nombre_completo
          )
        `);
      
      console.log('🔍 Datos de Supabase con JOIN - Total registros:', result.data?.length);
      
      if (result.error) {
        console.log('⚠️ Error en JOIN, intentando consulta simple...', result.error);
        
        // Si falla el JOIN, hacer consulta simple
        const simpleResult = await supabase
          .from('tickets')
          .select('*');
          
        if (simpleResult.error) {
          throw simpleResult.error;
        }
        
        result.data = simpleResult.data;
      }
      
      if (result.data && result.data.length > 0) {
        // Procesar cada ticket individualmente con transformación completa
        const processedTickets = result.data.map((ticket, index) => {
          
          // Extraer nombre del cliente de múltiples fuentes
          let customerName = 'Sin titular';
          
          if (ticket.customer) {
            customerName = ticket.customer.full_name || ticket.customer.nombre_completo || 
                          ticket.customer.name || ticket.customer.nombre || 
                          ticket.customer.id;
          } else {
            customerName = ticket.customer_name || ticket.titular || ticket.contact_name || 
                          (ticket.metadata && ticket.metadata.titular) || 
                          (ticket.metadata && ticket.metadata.nombre_cliente) ||
                          (ticket.metadata && ticket.metadata.customer_name) ||
                            ticket.customer_id || 'Sin titular';
            }
            
            console.log(`👥 Nombre del cliente determinado: "${customerName}"`);
            
            const transformedTicket = {
              // Mantener todos los campos originales de la DB
              ...ticket,
              
              // Campos transformados para la UI
              id: ticket.id,
              folio: ticket.folio || `FOLIO-${ticket.id}`,
              titulo: ticket.titulo || `Ticket ${ticket.folio || ticket.id}`,
              numero_ticket: ticket.folio || `TKT-${ticket.id}`,
              descripcion_breve: ticket.descripcion || `Ticket ${ticket.folio || ticket.id}`,
              canal: ticket.channel || 'web',
              estado: ticket.status || 'open',
              prioridad: ticket.priority || 'medium',
              grupo_asignacion: ticket.service_type || ticket.ticket_type || 'general',
              asignado_a: ticket.assigned_to || null,
              
              assignedTo: ticket.assigned_to || 'Sin asignar',
              createdAt: ticket.created_at 
                ? new Date(ticket.created_at).toLocaleString("es-MX")
                : 'No disponible',
              actualizado: ticket.updated_at || ticket.created_at,
              location: 'No especificada', 
              category: ticket.service_type || ticket.ticket_type || 'General',
              channel: ticket.channel,
              customer_id: ticket.customer_id,
              customer_name: ticket.customer_name,
              assigned_at: ticket.assigned_at,
              escalated_to: ticket.escalated_to,
              escalated_at: ticket.escalated_at,
              resolution_notes: ticket.resolution_notes,
              resolved_at: ticket.resolved_at,
              closed_at: ticket.closed_at,
              sla_deadline: ticket.sla_deadline,
              sla_breached: ticket.sla_breached,
              tags: Array.isArray(ticket.tags) ? ticket.tags : [],
              metadata: ticket.metadata || {},
              conversations: [] 
            };
            
            console.log(`✅ Ticket transformado ${index + 1} - titular final: "${transformedTicket.titular}", numero_ticket: "${transformedTicket.numero_ticket}"`);
            return transformedTicket;
          });

          console.log('Tickets procesados:', processedTickets.length);
          setSupabaseTickets(processedTickets);
        } else {
          console.log('No se encontraron tickets en la base de datos');
          setSupabaseTickets([]);
        }
      } catch (e) {
        console.error('Error al obtener tickets:', e);
        setSupabaseTickets([]);
      } finally {
        setIsLoadingSupabase(false);
      }
    };



  // Cargar datos al montar el componente
  useEffect(() => {
    getTickets();
  }, []);  

  const getFieldValue = (ticket: any, field: TicketField): string => {
    switch (field) {
      case "numero_ticket":
        return ticket.numero_ticket || ticket.folio || `TKT-${ticket.id}` || "-";
      case "numero_reporte_cea_app":
        return ticket.numero_reporte_cea_app || "-";
      case "descripcion_breve":
        return ticket.descripcion_breve || ticket.titulo || ticket.descripcion || "-";
      case "titular":
        return ticket.titulo || "Sin titular";
      case "canal":
        return mapChannel(ticket.canal || ticket.channel) || "-";
      case "estado":
        return mapStatus(ticket.estado || ticket.status) || "-";
      case "prioridad":
        return mapPriority(ticket.prioridad || ticket.priority) || "-";
      case "grupo_asignacion":
        return mapAssignmentGroup(ticket.grupo_asignacion || ticket.service_type || ticket.ticket_type) || "-";
      case "asignado_a":
        return ticket.asignado_a || ticket.assigned_to || "Sin asignar";
      case "actualizado":
        return ticket.actualizado
          ? new Date(ticket.actualizado).toLocaleString("es-MX")
          : ticket.updated_at
          ? new Date(ticket.updated_at).toLocaleString("es-MX")
          : ticket.created_at
          ? new Date(ticket.created_at).toLocaleString("es-MX")
          : "-";
      case "numero_contrato":
        return ticket.numero_contrato || "-";
      case "colonia":
        return ticket.colonia || (ticket.metadata && ticket.metadata.colonia) || "-";
      case "direccion":
        return ticket.direccion || (ticket.metadata && ticket.metadata.ubicacion) || "-";
      case "observaciones_internas":
        return ticket.observaciones_internas || ticket.resolution_notes || "-";
      case "administracion":
        return ticket.administracion || "-";
      case "numero_orden_aquacis":
        return ticket.numero_orden_aquacis || "-";
      default:
        return "-";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "abierto":
        return "default";
      case "en_progreso":
        return "secondary";
      case "resuelto":
        return "outline";
      case "cerrado":
        return "secondary";
      default:
        return "default";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "urgente":
        return "destructive";
      case "alta":
        return "destructive";
      case "media":
        return "default";
      case "baja":
        return "outline";
      default:
        return "default";
    }
  };

  

  return (
    <div className="flex h-full flex-col overflow-hidden -m-6">
      <div className="flex-shrink-0 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground">
              Gestiona todos los tickets del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={getTickets}
              disabled={isLoadingSupabase}
              className="gap-2"
            >
              {isLoadingSupabase ? "� Cargando..." : "Actualizar Datos"}
            </Button>
            <Button
              className="gap-2"
              onClick={() => navigate('/tickets/new')}
            >
              <Plus className="h-4 w-4" />
              Nuevo Ticket
            </Button>
          </div>
        </div>

        {/* User Type Switcher */}
        <div className="flex items-center gap-4 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="user-type">Vista como:</Label>
          </div>
          <Select value={selectedUserType} onValueChange={(value: UserType) => setSelectedUserType(value)}>
            <SelectTrigger className="w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allUserTypes.map((userType) => (
                <SelectItem key={userType} value={userType}>
                  {getUserTypeDisplayName(userType)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            Mostrando {visibleFields.length} campos visibles
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="open">Abierto</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="resolved">Resuelto</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las prioridades</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {isLoadingSupabase ? "Cargando tickets desde Supabase..." : `Mostrando ${filteredTickets.length} tickets`}
        </div>
      </div>

      {/* Table View - Scrollable Container */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <div className="h-full overflow-auto rounded-md border">
          <div className="min-w-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  {visibleFields.map((field) => (
                    <TableHead key={field} className="whitespace-nowrap">
                      {FIELD_LABELS[field]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingSupabase ? (
                  <TableRow>
                    <TableCell colSpan={visibleFields.length} className="text-center py-8">
                      Cargando tickets desde Supabase...
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleFields.length} className="text-center py-8">
                      {supabaseTickets.length === 0 ? "No hay tickets en la base de datos" : "No se encontraron tickets que coincidan con los filtros"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      {visibleFields.map((field) => {
                        const value = getFieldValue(ticket, field);
                        return (
                          <TableCell key={field} className="whitespace-nowrap">
                            {field === "estado" ? (
                              <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge>
                            ) : field === "prioridad" ? (
                              <Badge variant={getPriorityBadgeVariant(value)}>{value}</Badge>
                            ) : (
                              <span className="truncate block max-w-[200px]" title={value}>
                                {value}
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              Crear Nuevo Ticket
            </DialogTitle>
            <DialogDescription>
              Completa la información para crear un nuevo ticket en el sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titular">Titular (Persona haciendo el reporte) *</Label>
              <Input
                id="titular"
                placeholder="Ej: Juan Pérez"
                value={newTicket.titular}
                onChange={(e) => setNewTicket({ ...newTicket, titular: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción Breve *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el problema o solicitud..."
                value={newTicket.descripcion_breve}
                onChange={(e) => setNewTicket({ ...newTicket, descripcion_breve: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="canal">Canal</Label>
                <Select
                  value={newTicket.canal}
                  onValueChange={(value: ContactChannel) =>
                    setNewTicket({ ...newTicket, canal: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telefono">Teléfono</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="app">App</SelectItem>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grupo_asignacion">Grupo de Asignación</Label>
                <Select
                  value={newTicket.grupo_asignacion}
                  onValueChange={(value: AssignmentGroup) =>
                    setNewTicket({ ...newTicket, grupo_asignacion: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distribucion">Distribución</SelectItem>
                    <SelectItem value="atencion_cliente">Atención al Cliente</SelectItem>
                    <SelectItem value="call_center">Call Center</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={newTicket.estado}
                  onValueChange={(value: "open" | "in_progress" | "resolved" | "closed") =>
                    setNewTicket({ ...newTicket, estado: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Abierto</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="resolved">Resuelto</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select
                  value={newTicket.prioridad}
                  onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                    setNewTicket({ ...newTicket, prioridad: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asignado_a">Asignar a (Opcional)</Label>
              <Select
                value={newTicket.asignado_a || ""}
                onValueChange={(value) =>
                  setNewTicket({ ...newTicket, asignado_a: value || null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {agentsData && agentsData.length > 0 ? (
                    agentsData.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))
                  ) : null}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setNewTicket({
                  descripcion_breve: "",
                  titular: "",
                  canal: "telefono",
                  estado: "open",
                  prioridad: "medium",
                  grupo_asignacion: "atencion_cliente",
                  asignado_a: null,
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!newTicket.descripcion_breve.trim() || !newTicket.titular.trim()) {
                  return;
                }

                try {
                  await createTicket({
                    descripcion_breve: newTicket.descripcion_breve.trim(),
                    titular: newTicket.titular.trim(),
                    canal: newTicket.canal,
                    estado: newTicket.estado,
                    prioridad: newTicket.prioridad,
                    grupo_asignacion: newTicket.grupo_asignacion,
                    asignado_a: newTicket.asignado_a || null,
                    actualizado: null,
                    agent_id: newTicket.asignado_a || null,
                    numero_reporte_cea_app: newTicket.numero_reporte_cea_app || null,
                    numero_contrato: newTicket.numero_contrato || null,
                    colonia: newTicket.colonia || null,
                    direccion: newTicket.direccion || null,
                    observaciones_internas: newTicket.observaciones_internas || null,
                    administracion: newTicket.administracion || null,
                    numero_orden_aquacis: newTicket.numero_orden_aquacis || null,
                  });
                  await queryClient.invalidateQueries({ queryKey: ["tickets"] });
                  setIsDialogOpen(false);
                  setNewTicket({
                    descripcion_breve: "",
                    titular: "",
                    canal: "telefono",
                    estado: "open",
                    prioridad: "medium",
                    grupo_asignacion: "atencion_cliente",
                    asignado_a: null,
                  });
                } catch (error) {
                  console.error("Failed to create ticket:", error);
                }
              }}
              disabled={!newTicket.descripcion_breve.trim() || !newTicket.titular.trim()}
            >
              Crear Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
