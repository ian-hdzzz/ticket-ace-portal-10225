// Componente para mostrar órdenes relacionadas con un ticket
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Settings,
  MapPin
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getOrdersByTicketId, createOrder } from "@/services/ordersService";
import { 
  CeaOrder, 
  CreateOrderRequest,
  OrderType,
  OrderPriority,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  ORDER_PRIORITY_LABELS,
  getOrderStatusColor,
  getOrderPriorityColor,
  getOrderTypeColor,
  isOrderOverdue
} from "@/types/orders";

interface TicketOrdersProps {
  ticketId: string;
  ticketData?: {
    folio: string;
    titulo: string;
    descripcion?: string;
    direccion?: string;
    numero_contrato?: string;
  };
}

export default function TicketOrders({ ticketId, ticketData }: TicketOrdersProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newOrder, setNewOrder] = useState<CreateOrderRequest>({
    ticket_id: ticketId,
    tipo: 'inspeccion',
    motivo: '',
    prioridad: 'media',
    nombre_cliente: '', // Este campo se mantendrá vacío inicialmente
    direccion: ticketData?.direccion || '',
    numero_contrato: ticketData?.numero_contrato || '',
  });

  // Query para obtener órdenes del ticket
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['orders', 'ticket', ticketId],
    queryFn: () => getOrdersByTicketId(ticketId),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const handleCreateOrder = async () => {
    if (!newOrder.motivo.trim()) {
      alert('Por favor ingresa un motivo para la orden');
      return;
    }

    setIsCreating(true);
    try {
      await createOrder(newOrder);
      refetch(); // Recargar la lista de órdenes
      setIsCreateDialogOpen(false);
      
      // Resetear el formulario
      setNewOrder({
        ticket_id: ticketId,
        tipo: 'inspeccion',
        motivo: '',
        prioridad: 'media',
        nombre_cliente: '',
        direccion: ticketData?.direccion || '',
        numero_contrato: ticketData?.numero_contrato || '',
      });
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear la orden. Intenta nuevamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Órdenes de Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Cargando órdenes...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Órdenes de Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">
            Error al cargar órdenes: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Órdenes de Trabajo ({orders.length})
          </CardTitle>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay órdenes de trabajo</h3>
            <p className="text-muted-foreground mb-4">
              Crea la primera orden de trabajo para este ticket
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Orden
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{order.numero_orden}</h4>
                      <Badge className={getOrderTypeColor(order.tipo)}>
                        {ORDER_TYPE_LABELS[order.tipo]}
                      </Badge>
                      <Badge className={getOrderStatusColor(order.estado)}>
                        {ORDER_STATUS_LABELS[order.estado]}
                      </Badge>
                      {isOrderOverdue(order) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.motivo}
                    </p>
                  </div>
                  <Badge variant="outline" className={getOrderPriorityColor(order.prioridad)}>
                    {ORDER_PRIORITY_LABELS[order.prioridad]}
                  </Badge>
                </div>

                {order.descripcion_trabajo && (
                  <p className="text-sm mb-3 text-muted-foreground">
                    {order.descripcion_trabajo}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {order.assigned_user?.full_name || 'Sin asignar'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDate(order.fecha_programada)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Creada: {formatDateTime(order.created_at)}
                    </span>
                  </div>
                </div>

                {order.direccion && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{order.direccion}</span>
                  </div>
                )}

                {(order.observaciones || order.notas_cierre) && (
                  <div className="mt-3 p-2 bg-muted rounded text-sm">
                    <strong>Observaciones:</strong> {order.observaciones || order.notas_cierre}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Dialog para crear nueva orden */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Crear Nueva Orden de Trabajo
            </DialogTitle>
            <DialogDescription>
              Genera una orden de trabajo para el ticket {ticketData?.folio}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Orden</Label>
                <Select
                  value={newOrder.tipo}
                  onValueChange={(value: OrderType) =>
                    setNewOrder({ ...newOrder, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={newOrder.prioridad}
                  onValueChange={(value: OrderPriority) =>
                    setNewOrder({ ...newOrder, prioridad: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORDER_PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de la Orden *</Label>
              <Textarea
                id="motivo"
                placeholder="Describe el motivo de la orden de trabajo..."
                value={newOrder.motivo}
                onChange={(e) => setNewOrder({ ...newOrder, motivo: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion_trabajo">Descripción del Trabajo</Label>
              <Textarea
                id="descripcion_trabajo"
                placeholder="Describe detalladamente el trabajo a realizar..."
                value={newOrder.descripcion_trabajo || ''}
                onChange={(e) => setNewOrder({ ...newOrder, descripcion_trabajo: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_programada">Fecha Programada</Label>
                <Input
                  id="fecha_programada"
                  type="date"
                  value={newOrder.fecha_programada || ''}
                  onChange={(e) => setNewOrder({ ...newOrder, fecha_programada: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiempo_estimado_horas">Tiempo Estimado (horas)</Label>
                <Input
                  id="tiempo_estimado_horas"
                  type="number"
                  min="1"
                  max="480"
                  placeholder="ej: 4"
                  value={newOrder.tiempo_estimado_horas || ''}
                  onChange={(e) => setNewOrder({ 
                    ...newOrder, 
                    tiempo_estimado_horas: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                placeholder="Dirección donde se realizará el trabajo"
                value={newOrder.direccion || ''}
                onChange={(e) => setNewOrder({ ...newOrder, direccion: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_cliente">Nombre del Cliente</Label>
                <Input
                  id="nombre_cliente"
                  placeholder="Nombre completo del cliente"
                  value={newOrder.nombre_cliente || ''}
                  onChange={(e) => setNewOrder({ ...newOrder, nombre_cliente: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_contrato">Número de Contrato</Label>
                <Input
                  id="numero_contrato"
                  placeholder="Número de contrato del cliente"
                  value={newOrder.numero_contrato || ''}
                  onChange={(e) => setNewOrder({ ...newOrder, numero_contrato: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Observaciones adicionales..."
                value={newOrder.observaciones || ''}
                onChange={(e) => setNewOrder({ ...newOrder, observaciones: e.target.value })}
                className="min-h-[60px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={!newOrder.motivo.trim() || isCreating}
            >
              {isCreating ? 'Creando...' : 'Crear Orden'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
