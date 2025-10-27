import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type TicketStatus = "abierto" | "en_progreso" | "resuelto" | "cerrado";
export type TicketPriority = "baja" | "media" | "alta" | "urgente";

interface TicketCardProps {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo?: string;
  createdAt: string;
  onClick?: () => void;
}

const statusConfig: Record<TicketStatus, { label: string; variant: "default" | "secondary" | "success" | "destructive" }> = {
  abierto: { label: "Abierto", variant: "default" },
  en_progreso: { label: "En Progreso", variant: "secondary" },
  resuelto: { label: "Resuelto", variant: "success" },
  cerrado: { label: "Cerrado", variant: "secondary" },
};

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  baja: { label: "Baja", className: "bg-muted text-muted-foreground" },
  media: { label: "Media", className: "bg-warning/10 text-warning border-warning/20" },
  alta: { label: "Alta", className: "bg-destructive/10 text-destructive border-destructive/20" },
  urgente: { label: "Urgente", className: "bg-destructive text-destructive-foreground" },
};

export function TicketCard({
  id,
  title,
  description,
  status,
  priority,
  assignedTo,
  createdAt,
  onClick,
}: TicketCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-medium hover:border-primary/20"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">#{id}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant={statusConfig[status].variant}>
              {statusConfig[status].label}
            </Badge>
            <Badge
              variant="outline"
              className={cn("border", priorityConfig[priority].className)}
            >
              {priorityConfig[priority].label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{createdAt}</span>
          </div>
          {assignedTo && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{assignedTo}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
