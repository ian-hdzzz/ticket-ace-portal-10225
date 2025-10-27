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
} from "lucide-react";
import { cn } from "@/lib/utils";

const ticketData: Record<string, any> = {
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
    comments: [
      {
        author: "Juan Pérez",
        date: "10 Oct 2025, 15:00",
        text: "Equipo técnico ya está en camino al sitio",
      },
      {
        author: "María González",
        date: "10 Oct 2025, 15:30",
        text: "Se requiere cerrar la calle temporalmente",
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
                Comentarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.comments.map((comment: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-card">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{comment.author}</p>
                      <p className="text-xs text-muted-foreground">{comment.date}</p>
                    </div>
                  </div>
                  <p className="ml-10 text-sm text-muted-foreground">{comment.text}</p>
                  {idx < ticket.comments.length - 1 && <Separator />}
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <Textarea placeholder="Agregar un comentario..." />
                <div className="flex justify-end">
                  <Button>Enviar Comentario</Button>
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
