import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Search, Plus, Filter, Ticket as TicketIcon, User, MoreVertical, BarChart3, PieChart as PieChartIcon, Download, Calendar } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { listTickets, createTicket } from "@/api/tickets";
import { listAgents } from "@/api/agents";
import type { Ticket, UserType, ContactChannel, AssignmentGroup } from "@/types/entities";
import { mapStatus, mapPriority, mapPriorityToApi, mapChannel, mapAssignmentGroup } from "@/lib/mappers";
import { getVisibleFields, FIELD_LABELS, getUserTypeDisplayName, type TicketField } from "@/lib/fieldVisibility";
import { allUserTypes } from "@/lib/userTypes";
import { supabase } from '../supabase/client.ts'

export default function Tickets() {
  const navigate = useNavigate();
  
  // Establecer el título de la página
  usePageTitle("Tickets", "Gestiona todos los tickets del sistema");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [priorityFilter, setPriorityFilter] = useState<string>("todos");
  const [selectedUserType, setSelectedUserType] = useState<UserType>("admin");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [supabaseTickets, setSupabaseTickets] = useState<any[]>([]);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primer día del mes actual
    end: new Date(), // Hoy
  });
  const [chartModal, setChartModal] = useState<{ 
    open: boolean; 
    field: TicketField | null; 
    type: "bar" | "pie" | null 
  }>({ open: false, field: null, type: null });
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
      
      // Filtro de fechas
      const ticketDate = new Date(ticket.created_at);
      const matchesDateRange = ticketDate >= dateRange.start && ticketDate <= dateRange.end;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesDateRange;
    });
  }, [supabaseTickets, searchQuery, statusFilter, priorityFilter, dateRange]);
  
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
        `)
        .order('created_at', { ascending: false }); // Ordenar por fecha de creación, más recientes primero
      
      console.log('Datos de Supabase con JOIN - Total registros:', result.data?.length);
      
      if (result.error) {
        console.log('Error en JOIN, intentando consulta simple...', result.error);
        
        // Si falla el JOIN, hacer consulta simple
        const simpleResult = await supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false }); // También ordenar aquí
          
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
              estado: ticket.status || 'abierto', // Usar estado de DB directamente
              prioridad: ticket.priority || 'media',
              grupo_asignacion: ticket.service_type || ticket.ticket_type || 'general',
              asignado_a: ticket.assigned_to || null,
              numero_contrato: ticket.contract_number || null, // Mapear contract_number a numero_contrato
              
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
            
            return transformedTicket;
          });

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
        return ticket.numero_contrato || ticket.contract_number || "-";
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
      case "en_proceso":
        return "warning"; // Amarillo para en proceso
      case "esperando_cliente":
        return "outline";
      case "esperando_interno": 
        return "outline";
      case "escalado":
        return "destructive";
      case "resuelto":
        return "success"; // Verde para resuelto
      case "cerrado":
        return "secondary"; // Gris para cerrado
      case "cancelado":
        return "destructive";
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

  // Función para generar datos de gráficos (usa tickets filtrados por fecha)
  const generateChartData = (field: TicketField) => {
    const counts: Record<string, number> = {};
    
    // Contar valores para cada campo usando tickets filtrados por fecha
    filteredTickets.forEach((ticket) => {
      const value = getFieldValue(ticket, field);
      if (value && value !== "-") {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    // Convertir a array para los gráficos
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      cantidad: value
    }));
  };

  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

  // Función para descargar el reporte como PDF
  const downloadPDF = async () => {
    if (!chartModal.field) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      
      // Título del reporte
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Reporte de Análisis de Tickets', margin, 20);
      
      // Subtítulo con el campo analizado
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Campo: ${FIELD_LABELS[chartModal.field]}`, margin, 30);
      pdf.text(`Tipo de gráfico: ${chartModal.type === 'bar' ? 'Barras' : 'Pastel'}`, margin, 37);
      pdf.text(`Rango de fechas: ${dateRange.start.toLocaleDateString('es-MX')} - ${dateRange.end.toLocaleDateString('es-MX')}`, margin, 44);
      pdf.text(`Total de tickets: ${filteredTickets.length}`, margin, 51);
      pdf.text(`Generado: ${new Date().toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, margin, 58);
      
      // Línea separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, 62, pageWidth - margin, 62);
      
      // Capturar el gráfico
      const chartElement = document.getElementById('chart-container');
      if (chartElement) {
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', margin, 68, imgWidth, imgHeight);
        
        // Agregar tabla resumen
        let yPosition = 68 + imgHeight + 15;
        
        // Si necesitamos una nueva página para la tabla
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Resumen de Datos', margin, yPosition);
        yPosition += 10;
        
        // Encabezados de tabla
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPosition, pageWidth - (margin * 2), 8, 'F');
        
        const col1Width = (pageWidth - (margin * 2)) * 0.5;
        const col2Width = (pageWidth - (margin * 2)) * 0.25;
        const col3Width = (pageWidth - (margin * 2)) * 0.25;
        
        pdf.text(FIELD_LABELS[chartModal.field], margin + 2, yPosition + 5);
        pdf.text('Cantidad', margin + col1Width + 2, yPosition + 5);
        pdf.text('Porcentaje', margin + col1Width + col2Width + 2, yPosition + 5);
        yPosition += 10;
        
        // Datos de la tabla
        pdf.setFont('helvetica', 'normal');
        const chartData = generateChartData(chartModal.field);
        const total = chartData.reduce((sum, i) => sum + i.value, 0);
        
        chartData.forEach((item, index) => {
          // Verificar si necesitamos nueva página
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          
          const percentage = ((item.value / total) * 100).toFixed(1);
          
          // Alternar color de fondo
          if (index % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(margin, yPosition - 5, pageWidth - (margin * 2), 8, 'F');
          }
          
          pdf.text(item.name, margin + 2, yPosition);
          pdf.text(item.cantidad.toString(), margin + col1Width + 2, yPosition);
          pdf.text(`${percentage}%`, margin + col1Width + col2Width + 2, yPosition);
          yPosition += 8;
        });
        
        // Fila de total
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(230, 230, 230);
        pdf.rect(margin, yPosition - 5, pageWidth - (margin * 2), 8, 'F');
        pdf.text('Total', margin + 2, yPosition);
        pdf.text(total.toString(), margin + col1Width + 2, yPosition);
        pdf.text('100%', margin + col1Width + col2Width + 2, yPosition);
      }
      
      // Guardar el PDF
      const fileName = `reporte_${chartModal.field}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta de nuevo.');
    }
  };

  

  return (
    <div className="flex h-full flex-col overflow-hidden -m-6">
      <div className="flex-shrink-0 space-y-6 p-6">
        {/* Date Range Filter and Ticket Count */}
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex gap-3 items-center">
            <label className="text-sm font-medium text-muted-foreground">Desde:</label>
            <input
              type="date"
              value={dateRange.start.toISOString().slice(0, 10)}
              onChange={(e) => setDateRange((r) => ({ ...r, start: new Date(e.target.value) }))}
              className="border rounded px-3 py-2 text-sm"
            />
            <label className="text-sm font-medium text-muted-foreground">Hasta:</label>
            <input
              type="date"
              value={dateRange.end.toISOString().slice(0, 10)}
              onChange={(e) => setDateRange((r) => ({ ...r, end: new Date(e.target.value + 'T23:59:59') }))}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="text-muted-foreground">
            {isLoadingSupabase 
              ? "Cargando tickets desde Supabase..." 
              : `Mostrando ${filteredTickets.length} de ${supabaseTickets.length} tickets (${dateRange.start.toLocaleDateString('es-MX')} - ${dateRange.end.toLocaleDateString('es-MX')})`
            }
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
            {/* User Type Switcher */}
            <Select value={selectedUserType} onValueChange={(value: UserType) => setSelectedUserType(value)}>
              <SelectTrigger className="w-[200px]">
                <User className="mr-2 h-4 w-4" />
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="abierto">Abierto</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="esperando_cliente">Esperando Cliente</SelectItem>
                <SelectItem value="esperando_interno">Esperando Interno</SelectItem>
                <SelectItem value="escalado">Escalado</SelectItem>
                <SelectItem value="resuelto">Resuelto</SelectItem>
                <SelectItem value="cerrado">Cerrado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
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

            <Button
              variant="outline"
              onClick={getTickets}
              disabled={isLoadingSupabase}
              className="gap-2"
            >
              {isLoadingSupabase ? "🔄 Cargando..." : "Actualizar Datos"}
            </Button>
            <Button
              className="gap-2"
              onClick={() => navigate('/dashboard/tickets/new')}
            >
              <Plus className="h-4 w-4" />
              Nuevo Ticket
            </Button>
          </div>
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
                      <div className="flex items-center justify-between gap-2">
                        <span>{FIELD_LABELS[field]}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 hover:bg-accent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setChartModal({ open: true, field, type: "bar" });
                              }}
                            >
                              <BarChart3 className="mr-2 h-4 w-4" /> 
                              Gráfico de barras
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setChartModal({ open: true, field, type: "pie" });
                              }}
                            >
                              <PieChartIcon className="mr-2 h-4 w-4" /> 
                              Gráfico de pastel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
                      onClick={() => navigate(`/dashboard/tickets/${ticket.id}`)}
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

      {/* Chart Modal */}
      <Dialog open={chartModal.open} onOpenChange={(open) => setChartModal({ open, field: null, type: null })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {chartModal.type === "bar" ? (
                <BarChart3 className="h-5 w-5" />
              ) : (
                <PieChartIcon className="h-5 w-5" />
              )}
              {chartModal.field && `Análisis de ${FIELD_LABELS[chartModal.field]}`}
            </DialogTitle>
            <DialogDescription>
              {chartModal.type === "bar" ? "Gráfico de barras" : "Gráfico de pastel"} mostrando la distribución de {chartModal.field && FIELD_LABELS[chartModal.field].toLowerCase()}
              <br />
              <span className="text-xs">
                Período: {dateRange.start.toLocaleDateString('es-MX')} - {dateRange.end.toLocaleDateString('es-MX')} 
                ({filteredTickets.length} tickets)
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {chartModal.field && chartModal.type && (
              <div id="chart-container" className="w-full h-[400px]">
                {chartModal.type === "bar" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={generateChartData(chartModal.field)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="cantidad" fill="#8884d8" name="Cantidad de tickets">
                        {generateChartData(chartModal.field).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={generateChartData(chartModal.field)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {generateChartData(chartModal.field).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {/* Tabla resumen */}
            {chartModal.field && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Resumen de datos</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{FIELD_LABELS[chartModal.field]}</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Porcentaje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generateChartData(chartModal.field).map((item, index) => {
                        const total = generateChartData(chartModal.field).reduce((sum, i) => sum + i.value, 0);
                        const percentage = ((item.value / total) * 100).toFixed(1);
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.cantidad}</TableCell>
                            <TableCell className="text-right">{percentage}%</TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">
                          {generateChartData(chartModal.field).reduce((sum, i) => sum + i.value, 0)}
                        </TableCell>
                        <TableCell className="text-right">100%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={downloadPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => setChartModal({ open: false, field: null, type: null })}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
