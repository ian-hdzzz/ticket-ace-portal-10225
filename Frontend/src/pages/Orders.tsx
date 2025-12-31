// Componente principal para gestionar órdenes de trabajo
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  User,
  MapPin,
  FileText,
  Settings,
  Download,
  MoreVertical
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getOrders } from "@/services/ordersService";
import { 
  CeaOrder, 
  OrderFilters, 
  OrderStatus, 
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

export default function Orders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [priorityFilter, setPriorityFilter] = useState<string>("todos");
  const [selectedOrder, setSelectedOrder] = useState<CeaOrder | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primer día del mes actual
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // Último día del mes actual
  });

  // Filtros para la query
  const filters: OrderFilters = useMemo(() => {
    const f: OrderFilters = {
      fecha_desde: dateRange.start.toISOString().split('T')[0],
      fecha_hasta: dateRange.end.toISOString().split('T')[0],
    };

    if (statusFilter !== "todos") {
      f.estado = [statusFilter as OrderStatus];
    }
    if (typeFilter !== "todos") {
      f.tipo = [typeFilter as OrderType];
    }
    if (priorityFilter !== "todos") {
      f.prioridad = [priorityFilter as OrderPriority];
    }
    if (searchQuery.trim()) {
      f.search = searchQuery.trim();
    }

    return f;
  }, [searchQuery, statusFilter, typeFilter, priorityFilter, dateRange]);

  // Query para obtener órdenes
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => getOrders(filters),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = orders.length;
    const pendientes = orders.filter(order => 
      order.estado === 'pendiente' || order.estado === 'programada'
    ).length;
    const en_proceso = orders.filter(order => order.estado === 'en_proceso').length;
    const completadas = orders.filter(order => order.estado === 'completada').length;
    const vencidas = orders.filter(order => isOrderOverdue(order)).length;
    const urgentes = orders.filter(order => 
      order.prioridad === 'urgente' || order.prioridad === 'critica'
    ).length;

    return { total, pendientes, en_proceso, completadas, vencidas, urgentes };
  }, [orders]);

  const handleOrderClick = (order: CeaOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleCreateOrder = () => {
    navigate('/orders/new');
  };

  const handleRefresh = () => {
    refetch();
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header con estadísticas */}
      <div className="flex-shrink-0 space-y-6 p-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendientes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Play className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.en_proceso}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completadas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.vencidas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
              <XCircle className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.urgentes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Controles de filtrado */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Rango de fechas */}
          <div className="flex gap-2 items-center">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={dateRange.start.toISOString().slice(0, 10)}
              onChange={(e) => setDateRange((r) => ({ ...r, start: new Date(e.target.value) }))}
              className="border rounded px-3 py-2 text-sm"
            />
            <span className="text-sm text-muted-foreground">-</span>
            <input
              type="date"
              value={dateRange.end.toISOString().slice(0, 10)}
              onChange={(e) => setDateRange((r) => ({ ...r, end: new Date(e.target.value + 'T23:59:59') }))}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de orden, motivo o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {Object.entries(ORDER_PRIORITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Actualizar
            </Button>

            <Button onClick={handleCreateOrder} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Orden
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de órdenes */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <div className="h-full overflow-auto rounded-md border">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Cargando órdenes...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-red-600">Error al cargar órdenes: {error.message}</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">No se encontraron órdenes</div>
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="w-[120px]">Número</TableHead>
                  <TableHead>Ticket Origen</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Asignado a</TableHead>
                  <TableHead>Fecha Program.</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleOrderClick(order)}
                  >
                    <TableCell className="font-medium">
                      {order.numero_orden}
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <div>{order.ticket?.numero_ticket || order.ticket?.folio || `TKT-${order.ticket_id}`}</div>
                        <div className="text-muted-foreground text-xs truncate max-w-[200px]">
                          {order.motivo}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={getOrderTypeColor(order.tipo)}>
                        {ORDER_TYPE_LABELS[order.tipo]}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm max-w-[150px] truncate">
                        {order.nombre_cliente || order.ticket?.nombre_cliente || 'Sin especificar'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={getOrderStatusColor(order.estado)}>
                        {ORDER_STATUS_LABELS[order.estado]}
                      </Badge>
                      {isOrderOverdue(order) && (
                        <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={getOrderPriorityColor(order.prioridad)}>
                        {ORDER_PRIORITY_LABELS[order.prioridad]}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {order.assigned_user?.full_name || 'Sin asignar'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {formatDate(order.fecha_programada)}
                      </div>
                    </TableCell>

                    <TableCell>
                      {order.sla_deadline && (
                        <div className={`text-xs ${isOrderOverdue(order) ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {formatDate(order.sla_deadline)}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}/edit`)}>
                            Editar orden
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/tickets/${order.ticket_id}`)}>
                            Ver ticket origen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Dialog de detalles de orden */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Orden {selectedOrder.numero_orden}
                </DialogTitle>
                <DialogDescription>
                  Información detallada de la orden de trabajo
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                    <div className="mt-1">
                      <Badge className={getOrderTypeColor(selectedOrder.tipo)}>
                        {ORDER_TYPE_LABELS[selectedOrder.tipo]}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                    <div className="mt-1">
                      <Badge className={getOrderStatusColor(selectedOrder.estado)}>
                        {ORDER_STATUS_LABELS[selectedOrder.estado]}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Motivo</label>
                  <p className="mt-1 text-sm">{selectedOrder.motivo}</p>
                </div>

                {selectedOrder.descripcion_trabajo && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Descripción del trabajo</label>
                    <p className="mt-1 text-sm">{selectedOrder.descripcion_trabajo}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                    <p className="mt-1 text-sm">{selectedOrder.nombre_cliente || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Asignado a</label>
                    <p className="mt-1 text-sm">{selectedOrder.assigned_user?.full_name || 'Sin asignar'}</p>
                  </div>
                </div>

                {selectedOrder.direccion && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                    <p className="mt-1 text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedOrder.direccion}
                      {selectedOrder.colonia && `, ${selectedOrder.colonia}`}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">Creada</label>
                    <p className="mt-1">{formatDateTime(selectedOrder.created_at)}</p>
                  </div>
                  {selectedOrder.fecha_programada && (
                    <div>
                      <label className="font-medium text-muted-foreground">Programada</label>
                      <p className="mt-1">{formatDate(selectedOrder.fecha_programada)}</p>
                    </div>
                  )}
                  {selectedOrder.sla_deadline && (
                    <div>
                      <label className="font-medium text-muted-foreground">SLA</label>
                      <p className={`mt-1 ${isOrderOverdue(selectedOrder) ? 'text-red-600' : ''}`}>
                        {formatDate(selectedOrder.sla_deadline)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOrderDetailsOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => navigate(`/orders/${selectedOrder.id}`)}
                >
                  Ver detalles completos
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
