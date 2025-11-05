import { useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  status: "abierto" | "en_progreso" | "resuelto" | "cerrado";
  priority: "baja" | "media" | "alta" | "urgente";
  assignedTo: string;
  createdAt: string;
  location: string;
  category: string;
  conversations: Conversation[];
}

const ticketData: Record<string, TicketData> = {
  "TKT-1234": {
    id: "TKT-1234",
    title: "Fuga de agua en Av. Constituyentes",
    description: "Reporte de fuga importante en la zona centro, requiere atención inmediata. El agua está saliendo por la banqueta y afectando el tráfico vehicular.",
    status: "en_progreso",
    priority: "urgente",
    assignedTo: "Juan Pérez",
    createdAt: "10 Oct 2025, 14:30",
    location: "Av. Constituyentes #123, Centro",
    category: "Infraestructura",
    conversations: [
      {
        id: 1,
        channel: "phone",
        type: "incoming",
        from: "Cliente: Roberto García",
        to: "Sistema CEA",
        message: "Buenos días, llamo para reportar una fuga de agua muy grande en Av. Constituyentes. El agua está saliendo por la banqueta.",
        timestamp: "10 Oct 2025, 14:30",
      },
      {
        id: 2,
        channel: "system",
        type: "system",
        message: "Ticket TKT-1234 creado automáticamente y asignado a Juan Pérez",
        timestamp: "10 Oct 2025, 14:31",
      },
      {
        id: 3,
        channel: "email",
        type: "outgoing",
        from: "Juan Pérez",
        to: "roberto.garcia@email.com",
        subject: "Confirmación de reporte #TKT-1234",
        message: "Estimado Roberto, hemos recibido su reporte de fuga. Nuestro equipo técnico está revisando la situación y se dirigirá al lugar en breve.",
        timestamp: "10 Oct 2025, 14:45",
      },
      {
        id: 4,
        channel: "chat",
        type: "internal",
        from: "Juan Pérez",
        to: "Equipo Técnico",
        message: "Equipo técnico ya está en camino al sitio. Es una fuga importante que requiere cierre temporal de calle.",
        timestamp: "10 Oct 2025, 15:00",
      },
      {
        id: 5,
        channel: "whatsapp",
        type: "outgoing",
        from: "Sistema CEA",
        to: "Roberto García",
        message: "Hola Roberto 👋 Te informamos que nuestro equipo ya está en camino. Tiempo estimado de llegada: 20 minutos.",
        timestamp: "10 Oct 2025, 15:15",
      },
      {
        id: 6,
        channel: "phone",
        type: "outgoing",
        from: "María González",
        to: "Roberto García",
        message: "Llamada para actualizar sobre el progreso. Se requiere cerrar la calle temporalmente para reparar la tubería.",
        timestamp: "10 Oct 2025, 15:30",
      },
    ],
  },
};

const statusConfig = {
  abierto: { label: "Abierto", variant: "default" as const },
  en_progreso: { label: "En Progreso", variant: "secondary" as const },
  resuelto: { label: "Resuelto", variant: "success" as const },
  cerrado: { label: "Cerrado", variant: "secondary" as const },
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
  const ticket = ticketData[id || ""];

  if (!ticket) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Ticket no encontrado</h2>
          <p className="text-muted-foreground mt-2">
            El ticket que buscas no existe
          </p>
          <Button onClick={() => navigate("/tickets")} className="mt-4">
            Volver a Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/tickets")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{ticket.title}</h1>
          <p className="text-muted-foreground">#{ticket.id}</p>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ticket.status !== "resuelto" && ticket.status !== "cerrado" && (
                <Button className="w-full gap-2" variant="default">
                  <Check className="h-4 w-4" />
                  Marcar como Resuelto
                </Button>
              )}
              {ticket.status === "resuelto" && (
                <Button className="w-full gap-2" variant="default">
                  <CloseIcon className="h-4 w-4" />
                  Cerrar Ticket
                </Button>
              )}
              <Button className="w-full" variant="outline">
                Cambiar Estado
              </Button>
              <Button className="w-full" variant="outline">
                Reasignar
              </Button>
              <Button className="w-full" variant="outline">
                Cambiar Prioridad
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
