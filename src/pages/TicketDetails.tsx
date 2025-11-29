import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  FileText,
  MessageSquare,
  Mail,
  Phone,
  Check,
  X as CloseIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '../supabase/client.ts';
import * as ceaApi from "@/api/cea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Conversation {
  id: number;
  channel: "email" | "phone" | "chat" | "whatsapp" | "system";
  type: "incoming" | "outgoing" | "internal" | "system";
  from?: string;
  to?: string;
  subject?: string;
  message: string;
  timestamp: string;
}

interface TicketData {
  id: string;
  title: string;
  description: string;
  status: "abierto" | "cancelado" | "cerrado" | "en_proceso" | "escalado" | "esperando_cliente" | "esperando_interno" | "resuelto";
  priority: "baja" | "media" | "alta" | "urgente";
  assignedTo: string;
  createdAt: string;
  location: string;
  category: string;
  conversations: Conversation[];
}

const statusConfig = {
  abierto: { label: "Abierto", variant: "default" as const },
  en_proceso: { label: "En Proceso", variant: "secondary" as const },
  esperando_cliente: { label: "Esperando Cliente", variant: "outline" as const },
  esperando_interno: { label: "Esperando Interno", variant: "outline" as const },
  escalado: { label: "Escalado", variant: "destructive" as const },
  resuelto: { label: "Resuelto", variant: "success" as const },
  cerrado: { label: "Cerrado", variant: "secondary" as const },
  cancelado: { label: "Cancelado", variant: "destructive" as const },
};

const priorityConfig = {
  baja: { label: "Baja", className: "bg-muted text-muted-foreground" },
  media: { label: "Media", className: "bg-warning/10 text-warning border-warning/20" },
  alta: { label: "Alta", className: "bg-destructive/10 text-destructive border-destructive/20" },
  urgente: { label: "Urgente", className: "bg-destructive text-destructive-foreground" },
};

const channelIcons = {
  email: Mail,
  phone: Phone,
  chat: MessageSquare,
  whatsapp: MessageSquare,
  system: FileText,
};

const channelColors = {
  email: "text-primary",
  phone: "text-success",
  chat: "text-accent",
  whatsapp: "text-success",
  system: "text-muted-foreground",
};

const channelLabels = {
  email: "Email",
  phone: "Teléfono",
  chat: "Chat Interno",
  whatsapp: "WhatsApp",
  system: "Sistema",
};

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados para manejo de datos de Supabase
  const [ticket, setTicket] = useState<any>(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Work Order State
  const [isWorkOrderDialogOpen, setIsWorkOrderDialogOpen] = useState(false);
  const [isCreatingWorkOrder, setIsCreatingWorkOrder] = useState(false);
  const [workOrderData, setWorkOrderData] = useState({
    tipoOrden: "",
    motivoOrden: "",
    fechaEstimdaFin: "",
    observaciones: "",
    codigoReparacion: "",
  });

  // Función para obtener ticket específico desde Supabase
  const getTicketById = async (ticketId: string) => {
    setIsLoadingTicket(true);
    setError(null);

    try {

      const result = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();


      // Transformar datos para compatibilidad con la UI
      const transformedTicket = {
        id: result.data.id,
        folio: result.data.folio || `FOLIO-${result.data.id}`,
        title: result.data.titulo || `Ticket ${result.data.folio || result.data.id}`,
        description: result.data.descripcion || 'Este ticket no tiene descripción disponible. Se recomienda agregar más detalles.',
        status: mapStatusFromDB(result.data.status),
        priority: mapPriorityFromDB(result.data.priority),
        assignedTo: result.data.assigned_to || 'Sin asignar',
        createdAt: result.data.created_at
          ? new Date(result.data.created_at).toLocaleString("es-MX")
          : 'No disponible',
        location: 'No especificada', // No hay campo específico para ubicación  
        category: result.data.service_type || result.data.ticket_type || 'General',
        channel: result.data.channel,
        customer_id: result.data.customer_id,
        assigned_at: result.data.assigned_at,
        escalated_to: result.data.escalated_to,
        escalated_at: result.data.escalated_at,
        resolution_notes: result.data.resolution_notes,
        resolved_at: result.data.resolved_at,
        closed_at: result.data.closed_at,
        sla_deadline: result.data.sla_deadline,
        sla_breached: result.data.sla_breached,
        tags: Array.isArray(result.data.tags) ? result.data.tags : [],
        metadata: result.data.metadata || {},
        conversations: [] // Por ahora vacío, se puede implementar después
      };

      setTicket(transformedTicket);

    } catch (e) {
      console.error('Error al obtener ticket:', e);
      setError(`Error al cargar el ticket: ${e.message || 'Error desconocido'}`);
    } finally {
      setIsLoadingTicket(false);
      console.log('Loading terminado, isLoadingTicket ahora es false');
    }
  };

  // Funciones de mapeo para compatibilidad
  const mapStatusFromDB = (status: string) => {
    console.log('Mapeando estado:', status);
    const statusMap: { [key: string]: "abierto" | "cancelado" | "cerrado" | "en_proceso" | "escalado" | "esperando_cliente" | "esperando_interno" | "resuelto" } = {
      'abierto': 'abierto',
      'en_proceso': 'en_proceso',
      'esperando_cliente': 'esperando_cliente',
      'esperando_interno': 'esperando_interno',
      'escalado': 'escalado',
      'resuelto': 'resuelto',
      'cerrado': 'cerrado',
      'cancelado': 'cancelado'
    };
    const mappedStatus = statusMap[status] || 'abierto';
    console.log(' Estado mapeado:', mappedStatus);
    return mappedStatus;
  };

  const mapPriorityFromDB = (priority: string) => {
    console.log('⚡ Mapeando prioridad:', priority);
    const priorityMap: { [key: string]: "baja" | "media" | "alta" | "urgente" } = {
      'baja': 'baja',
      'media': 'media',
      'alta': 'alta',
      'urgente': 'urgente'
    };
    const mappedPriority = priorityMap[priority] || 'media';
    console.log('Prioridad mapeada:', mappedPriority);
    return mappedPriority;
  };

  // Función para crear Orden de Trabajo
  const handleCreateWorkOrder = async () => {
    if (!ticket?.id || !ticket?.metadata?.numero_contrato) {
      toast.error("No se puede crear OT: Falta ID de ticket o número de contrato");
      return;
    }

    setIsCreatingWorkOrder(true);
    try {
      // 1. Crear OT en Aquacis
      const otData = {
        ...workOrderData,
        numContrato: ticket.metadata.numero_contrato,
        fechaCreacionOrden: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        idPtoServicio: ticket.metadata.id_punto_servicio || "0", // Fallback or from metadata
        anyoExpediente: new Date().getFullYear().toString(),
      };

      console.log("Creating Work Order with data:", otData);
      const otResponse = await ceaApi.crearOrdenTrabajo(otData);
      console.log("OT Response:", otResponse);

      // Parse response to get OT ID
      let otId = null;
      if (otResponse instanceof Document) {
        const idTag = otResponse.getElementsByTagName("idOrden")[0] || otResponse.getElementsByTagName("return")[0];
        if (idTag) otId = idTag.textContent;
      }

      if (!otId) {
        console.warn("Could not parse OT ID from response, using mock ID if in demo mode");
        otId = "OT-" + Date.now();
      }

      toast.success(`Orden de Trabajo creada: ${otId}`);

      // 2. Vincular OT con Ticket en CEA App
      await ceaApi.referenceWorkOrderAquacis(ticket.id, otId);
      toast.success("Orden de Trabajo vinculada al caso");

      // 3. Guardar en Supabase
      const { error } = await supabase
        .from('tickets')
        .update({
          metadata: {
            ...ticket.metadata,
            orden_aquacis: otId
          }
        })
        .eq('id', ticket.id);

      if (error) throw error;

      // 4. Actualizar estado local
      setTicket((prev: any) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          orden_aquacis: otId
        }
      }));

      setIsWorkOrderDialogOpen(false);

    } catch (e: any) {
      console.error("Error creating Work Order:", e);
      toast.error(`Error al crear OT: ${e.message}`);
    } finally {
      setIsCreatingWorkOrder(false);
    }
  };

  // Función para actualizar estado del ticket
  const updateTicketStatus = async (newStatus: "abierto" | "cancelado" | "cerrado" | "en_proceso" | "escalado" | "esperando_cliente" | "esperando_interno" | "resuelto") => {
    if (!ticket?.id) return;

    try {
      console.log(`Actualizando ticket ${ticket.id} a estado:`, newStatus);

      // API Calls for specific statuses
      if (newStatus === "resuelto" || newStatus === "cerrado") {
        try {
          await ceaApi.updateCaseToClosed(ticket.id, "RESUELTO", ticket.resolution_notes || "Ticket resuelto desde portal");
          toast.success("Estado sincronizado con CEA App (Cerrado)");
        } catch (apiError) {
          console.error("Error syncing close status:", apiError);
          toast.error("Error al sincronizar cierre con CEA App");
        }
      } else if (newStatus === "cancelado") {
        try {
          await ceaApi.updateCaseToCancelled(ticket.id);
          toast.success("Estado sincronizado con CEA App (Cancelado)");
        } catch (apiError) {
          console.error("Error syncing cancel status:", apiError);
          toast.error("Error al sincronizar cancelación con CEA App");
        }
      }

      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Agregar timestamps específicos según el estado
      if (newStatus === "resuelto") {
        updateData.resolved_at = new Date().toISOString();
      } else if (newStatus === "cerrado") {
        updateData.closed_at = new Date().toISOString();
      } else if (newStatus === "en_proceso" && !ticket.assigned_at) {
        updateData.assigned_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticket.id);

      if (error) {
        console.error('Error al actualizar estado:', error);
        toast.error("Error al actualizar estado en base de datos");
        return;
      }

      // Recargar ticket para mostrar cambios
      await getTicketById(ticket.id.toString());
      console.log('Estado actualizado correctamente');
      toast.success(`Estado actualizado a: ${newStatus}`);

    } catch (e) {
      console.error('Error al actualizar ticket:', e);
      toast.error("Error desconocido al actualizar ticket");
    }
  };

  // Cargar ticket al montar el componente
  useEffect(() => {
    console.log(' Componente montado, ID del ticket:', id);
    if (id) {
      getTicketById(id);
    } else {
      console.log(' No se proporcionó ID de ticket');
      setError('No se proporcionó un ID de ticket válido');
      setIsLoadingTicket(false);
    }
  }, [id]);

  // Estados de carga y error
  console.log(' Estado del componente:', {
    isLoadingTicket,
    error,
    hasTicket: !!ticket,
    ticketId: id
  });

  if (isLoadingTicket) {
    console.log(' Estado: Cargando ticket...');
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Cargando ticket...</h2>
          <p className="text-muted-foreground mt-2">
            Obteniendo información desde la base de datos
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ID: {id}
          </p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    console.log(' Estado: Error o sin ticket', { error, ticket });
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {error || 'Ticket no encontrado'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {error || 'El ticket que buscas no existe en la base de datos'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ID buscado: {id}
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button onClick={() => navigate("/dashboard/tickets")}>
              Volver a Tickets
            </Button>
            <Button
              variant="outline"
              onClick={() => id && getTicketById(id)}
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log('Renderizando ticket:', ticket);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/dashboard/tickets")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{ticket.title}</h1>
          <p className="text-muted-foreground">#{ticket.folio}</p>
          {ticket.customer_id && (
            <p className="text-sm text-muted-foreground">Cliente ID: {ticket.customer_id}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant={statusConfig[ticket.status].variant}>
            {statusConfig[ticket.status].label}
          </Badge>
          <Badge
            variant="outline"
            className={cn("border", priorityConfig[ticket.priority].className)}
          >
            {priorityConfig[ticket.priority].label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{ticket.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Historial de Conversación
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Timeline completo de todas las interacciones con el cliente
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6 before:absolute before:left-5 before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-border">
                {ticket.conversations.map((conversation) => {
                  const ChannelIcon = channelIcons[conversation.channel as keyof typeof channelIcons];
                  const channelColor = channelColors[conversation.channel as keyof typeof channelColors];

                  return (
                    <div key={conversation.id} className="relative flex gap-4 pb-6">
                      <div className={cn(
                        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background",
                        conversation.type === "system" ? "bg-muted" : "bg-card"
                      )}>
                        <ChannelIcon className={cn("h-5 w-5", channelColor)} />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            {channelLabels[conversation.channel as keyof typeof channelLabels]}
                          </span>
                          {conversation.type === "incoming" && (
                            <Badge variant="secondary" className="text-xs">Entrante</Badge>
                          )}
                          {conversation.type === "outgoing" && (
                            <Badge variant="outline" className="text-xs">Saliente</Badge>
                          )}
                          {conversation.type === "internal" && (
                            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 text-xs">Interno</Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {conversation.timestamp}
                          </span>
                        </div>

                        {conversation.from && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">De:</span> {conversation.from}
                            {conversation.to && <> → <span className="font-medium">Para:</span> {conversation.to}</>}
                          </div>
                        )}

                        {conversation.subject && (
                          <div className="text-sm font-medium text-foreground">
                            {conversation.subject}
                          </div>
                        )}

                        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                          {conversation.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Llamar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
                <Textarea placeholder="Escribe un mensaje al cliente..." className="min-h-[80px]" />
                <div className="flex justify-end">
                  <Button className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Enviar Mensaje
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ticket.status !== "resuelto" && ticket.status !== "cerrado" && (
                <Button
                  className="w-full gap-2"
                  variant="default"
                  onClick={() => updateTicketStatus("resuelto")}
                >
                  <Check className="h-4 w-4" />
                  Marcar como Resuelto
                </Button>
              )}
              {ticket.status === "resuelto" && (
                <Button
                  className="w-full gap-2"
                  variant="default"
                  onClick={() => updateTicketStatus("cerrado")}
                >
                  <CloseIcon className="h-4 w-4" />
                  Cerrar Ticket
                </Button>
              )}
              <Button
                className="w-full"
                variant="outline"
                onClick={() => updateTicketStatus("en_proceso")}
                disabled={ticket.status === "en_proceso"}
              >
                {ticket.status === "en_proceso" ? "En Proceso ✓" : "Marcar En Proceso"}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => updateTicketStatus("abierto")}
                disabled={ticket.status === "abierto"}
              >
                {ticket.status === "abierto" ? "Abierto ✓" : "Reabrir Ticket"}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => getTicketById(ticket.id.toString())}
              >
                Actualizar Datos
              </Button>

              <Separator className="my-2" />

              <Dialog open={isWorkOrderDialogOpen} onOpenChange={setIsWorkOrderDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full gap-2"
                    variant="secondary"
                    disabled={!!ticket.metadata?.orden_aquacis}
                  >
                    <FileText className="h-4 w-4" />
                    {ticket.metadata?.orden_aquacis ? `OT: ${ticket.metadata.orden_aquacis}` : "Generar Orden de Trabajo"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Orden de Trabajo (Aquacis)</DialogTitle>
                    <DialogDescription>
                      Complete los datos para generar una nueva orden de trabajo vinculada a este ticket.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tipoOrden" className="text-right">
                        Tipo
                      </Label>
                      <Select
                        onValueChange={(val) => setWorkOrderData({ ...workOrderData, tipoOrden: val })}
                        value={workOrderData.tipoOrden}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REPARACION">Reparación</SelectItem>
                          <SelectItem value="INSPECCION">Inspección</SelectItem>
                          <SelectItem value="INSTALACION">Instalación</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="motivo" className="text-right">
                        Motivo
                      </Label>
                      <Input
                        id="motivo"
                        className="col-span-3"
                        value={workOrderData.motivoOrden}
                        onChange={(e) => setWorkOrderData({ ...workOrderData, motivoOrden: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fechaFin" className="text-right">
                        Fecha Fin
                      </Label>
                      <Input
                        id="fechaFin"
                        type="date"
                        className="col-span-3"
                        value={workOrderData.fechaEstimdaFin}
                        onChange={(e) => setWorkOrderData({ ...workOrderData, fechaEstimdaFin: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="obs" className="text-right">
                        Observaciones
                      </Label>
                      <Textarea
                        id="obs"
                        className="col-span-3"
                        value={workOrderData.observaciones}
                        onChange={(e) => setWorkOrderData({ ...workOrderData, observaciones: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="codRep" className="text-right">
                        Cód. Rep.
                      </Label>
                      <Input
                        id="codRep"
                        className="col-span-3"
                        value={workOrderData.codigoReparacion}
                        onChange={(e) => setWorkOrderData({ ...workOrderData, codigoReparacion: e.target.value })}
                        placeholder="Ej. REP-001"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleCreateWorkOrder} disabled={isCreatingWorkOrder}>
                      {isCreatingWorkOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Crear Orden
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Creado</span>
                </div>
                <p className="text-sm font-medium ml-6">{ticket.createdAt}</p>
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Asignado a</span>
                </div>
                <p className="text-sm font-medium ml-6">{ticket.assignedTo}</p>
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Ubicación</span>
                </div>
                <p className="text-sm font-medium ml-6">{ticket.location}</p>
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Categoría</span>
                </div>
                <p className="text-sm font-medium ml-6">{ticket.category}</p>
              </div>

              {/* Campos extraídos del metadata */}
              {ticket.metadata && ticket.metadata.colonia && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Colonia</span>
                    </div>
                    <p className="text-sm font-medium ml-6">{ticket.metadata.colonia}</p>
                  </div>
                </>
              )}

              {ticket.metadata && ticket.metadata.ubicacion && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Dirección</span>
                    </div>
                    <p className="text-sm font-medium ml-6">{ticket.metadata.ubicacion}</p>
                  </div>
                </>
              )}

              {ticket.metadata && ticket.metadata.referencias && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Referencias</span>
                    </div>
                    <p className="text-sm font-medium ml-6">{ticket.metadata.referencias}</p>
                  </div>
                </>
              )}

              {ticket.metadata && ticket.metadata.tiempo_estimado && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Tiempo Estimado</span>
                    </div>
                    <p className="text-sm font-medium ml-6">{ticket.metadata.tiempo_estimado}</p>
                  </div>
                </>
              )}

              {ticket.channel && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>Canal de Contacto</span>
                    </div>
                    <p className="text-sm font-medium ml-6 capitalize">{ticket.channel}</p>
                  </div>
                </>
              )}

              {ticket.sla_deadline && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>SLA Deadline</span>
                    </div>
                    <p className="text-sm font-medium ml-6">
                      {new Date(ticket.sla_deadline).toLocaleString("es-MX")}
                      {ticket.sla_breached && (
                        <Badge variant="destructive" className="ml-2 text-xs">SLA Incumplido</Badge>
                      )}
                    </p>
                  </div>
                </>
              )}

              {ticket.resolution_notes && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Notas de Resolución</span>
                    </div>
                    <p className="text-sm font-medium ml-6">{ticket.resolution_notes}</p>
                  </div>
                </>
              )}

              {ticket.tags && ticket.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Etiquetas</span>
                    </div>
                    <div className="ml-6 flex flex-wrap gap-1">
                      {ticket.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {ticket.escalated_to && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Escalado a</span>
                    </div>
                    <p className="text-sm font-medium ml-6">{ticket.escalated_to}</p>
                    {ticket.escalated_at && (
                      <p className="text-xs text-muted-foreground ml-6">
                        Escalado el: {new Date(ticket.escalated_at).toLocaleString("es-MX")}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
