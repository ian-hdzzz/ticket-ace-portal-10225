import { useState, useMemo, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Download,
  Filter,
  X,
  Share2
} from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '@/supabase/client';
import { 
  getVisibleFields, 
  FIELD_LABELS, 
  type TicketField 
} from "@/lib/fieldVisibility";

interface ChartConfig {
  id: string;
  field: TicketField;
  type: "bar" | "pie";
  title: string;
}

interface ChartData {
  name: string;
  value: number;
  cantidad: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

export default function CrearReportes() {
  usePageTitle("Crear Reportes", "Genera reportes personalizados con múltiples gráficas");

  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [isAddChartDialogOpen, setIsAddChartDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Filtros
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [priorityFilter, setPriorityFilter] = useState<string>("todos");

  // Nuevo gráfico
  const [newChart, setNewChart] = useState<{
    field: TicketField | "";
    type: "bar" | "pie";
    title: string;
  }>({
    field: "",
    type: "bar",
    title: "",
  });

  // Obtener campos disponibles para graficar
  const availableFields = useMemo(() => {
    const allFields = getVisibleFields("admin");
    // Excluir campos que no son útiles para análisis de gráficas
    const excludedFields = [
      "numero_contrato",
      "titular",
      "actualizado",
      "colonia",
      "direccion",
      "observaciones_internas",
      "numero_orden_aquacis",
      "administracion"
    ];
    return allFields.filter(field => !excludedFields.includes(field));
  }, []);

  // Cargar tickets al montar
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const result = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (result.error) throw result.error;

      const processedTickets = result.data?.map((ticket) => ({
        ...ticket,
        numero_ticket: ticket.folio || `TKT-${ticket.id}`,
        descripcion_breve: ticket.descripcion || ticket.titulo || `Ticket ${ticket.id}`,
        estado: ticket.status || 'abierto',
        prioridad: ticket.priority || 'media',
        canal: ticket.channel || 'web',
        grupo_asignacion: ticket.service_type || ticket.ticket_type || 'general',
        asignado_a: ticket.assigned_to || 'Sin asignar',
        actualizado: ticket.updated_at || ticket.created_at,
        numero_contrato: ticket.contract_number,
        nombre_cliente: ticket.client_name || ticket.customer_name || 'Sin nombre',
      })) || [];

      setTickets(processedTickets);
    } catch (error) {
      console.error('Error cargando tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const ticketDate = new Date(ticket.created_at);
      const matchesDateRange = ticketDate >= dateRange.start && ticketDate <= dateRange.end;
      const matchesStatus = statusFilter === "todos" || ticket.estado === statusFilter;
      const matchesPriority = priorityFilter === "todos" || ticket.prioridad === priorityFilter;

      return matchesDateRange && matchesStatus && matchesPriority;
    });
  }, [tickets, dateRange, statusFilter, priorityFilter]);

  // Obtener valor de un campo del ticket
  const getFieldValue = (ticket: any, field: TicketField): string => {
    const fieldMap: Record<string, any> = {
      numero_ticket: ticket.numero_ticket || "-",
      descripcion_breve: ticket.descripcion_breve || "-",
      titular: ticket.titular || "Sin titular",
      nombre_cliente: ticket.nombre_cliente || "-",
      canal: mapChannel(ticket.canal) || "-",
      estado: mapStatus(ticket.estado) || "-",
      prioridad: mapPriority(ticket.prioridad) || "-",
      grupo_asignacion: mapAssignmentGroup(ticket.grupo_asignacion) || "-",
      asignado_a: ticket.asignado_a || "Sin asignar",
      numero_contrato: ticket.numero_contrato || "-",
      actualizado: ticket.actualizado 
        ? new Date(ticket.actualizado).toLocaleDateString('es-MX')
        : "-",
    };
    return fieldMap[field] || "-";
  };

  // Funciones de mapeo
  const mapChannel = (channel: string) => {
    const map: Record<string, string> = {
      telefono: "Teléfono",
      email: "Email",
      app_movil: "App Móvil",
      web: "Web",
      presencial: "Presencial",
      whatsapp: "WhatsApp",
    };
    return map[channel] || channel;
  };

  const mapStatus = (status: string) => {
    const map: Record<string, string> = {
      abierto: "Abierto",
      en_proceso: "En Proceso",
      esperando_cliente: "Esperando Cliente",
      esperando_interno: "Esperando Interno",
      escalado: "Escalado",
      resuelto: "Resuelto",
      cerrado: "Cerrado",
      cancelado: "Cancelado",
    };
    return map[status] || status;
  };

  const mapPriority = (priority: string) => {
    const map: Record<string, string> = {
      baja: "Baja",
      media: "Media",
      alta: "Alta",
      urgente: "Urgente",
    };
    return map[priority] || priority;
  };

  const mapAssignmentGroup = (group: string) => {
    const map: Record<string, string> = {
      distribucion: "Distribución",
      atencion_cliente: "Atención al Cliente",
      call_center: "Call Center",
      comercial: "Comercial",
      general: "General",
    };
    return map[group] || group;
  };

  // Generar datos para un gráfico
  const generateChartData = (field: TicketField): ChartData[] => {
    const counts: Record<string, number> = {};

    filteredTickets.forEach((ticket) => {
      const value = getFieldValue(ticket, field);
      if (value && value !== "-") {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      cantidad: value,
    }));
  };

  // Agregar gráfico
  const handleAddChart = () => {
    if (!newChart.field) return;

    const chartTitle = newChart.title || FIELD_LABELS[newChart.field as TicketField];

    const chart: ChartConfig = {
      id: `chart-${Date.now()}`,
      field: newChart.field as TicketField,
      type: newChart.type,
      title: chartTitle,
    };

    setCharts([...charts, chart]);
    setNewChart({ field: "", type: "bar", title: "" });
    setIsAddChartDialogOpen(false);
  };

  // Eliminar gráfico
  const handleRemoveChart = (chartId: string) => {
    setCharts(charts.filter((c) => c.id !== chartId));
  };

  // Descargar reporte completo como PDF
  const downloadFullReport = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;

      // Título del reporte
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Reporte de Análisis de Tickets', margin, 20);

      // Información general
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Fecha de generación: ${new Date().toLocaleString('es-MX')}`, margin, 30);
      pdf.text(`Período: ${dateRange.start.toLocaleDateString('es-MX')} - ${dateRange.end.toLocaleDateString('es-MX')}`, margin, 37);
      pdf.text(`Total de tickets: ${filteredTickets.length}`, margin, 44);

      // Filtros aplicados
      if (statusFilter !== "todos" || priorityFilter !== "todos") {
        let yPos = 51;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Filtros aplicados:', margin, yPos);
        pdf.setFont('helvetica', 'normal');
        yPos += 7;
        if (statusFilter !== "todos") {
          pdf.text(`Estado: ${mapStatus(statusFilter)}`, margin + 5, yPos);
          yPos += 7;
        }
        if (priorityFilter !== "todos") {
          pdf.text(`Prioridad: ${mapPriority(priorityFilter)}`, margin + 5, yPos);
        }
      }

      pdf.line(margin, 60, pageWidth - margin, 60);

      // Capturar y agregar cada gráfico
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        const chartElement = document.getElementById(`chart-${chart.id}`);

        if (chartElement) {
          if (i > 0) {
            pdf.addPage();
          }

          // Título del gráfico
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(chart.title, margin, 70);

          const canvas = await html2canvas(chartElement, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - (margin * 2);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', margin, 80, imgWidth, imgHeight);
        }
      }

      pdf.save(`reporte_tickets_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  // Compartir reporte
  const handleShareReport = () => {
    setIsShareDialogOpen(true);
  };

  const copyReportLink = () => {
    const reportConfig = {
      charts: charts.map(c => ({ field: c.field, type: c.type, title: c.title })),
      filters: {
        dateRange,
        status: statusFilter,
        priority: priorityFilter,
      },
    };
    
    // En producción, esto generaría una URL corta en el servidor
    const configString = btoa(JSON.stringify(reportConfig));
    const shareUrl = `${window.location.origin}/dashboard/crear-reportes?config=${configString}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Enlace copiado al portapapeles');
    }).catch(() => {
      alert('Error al copiar el enlace');
    });
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent('Reporte de Tickets - CEA Querétaro');
    const body = encodeURIComponent(
      `Hola,\n\nTe comparto el siguiente reporte de análisis de tickets:\n\n` +
      `- Período: ${dateRange.start.toLocaleDateString('es-MX')} - ${dateRange.end.toLocaleDateString('es-MX')}\n` +
      `- Total de tickets: ${filteredTickets.length}\n` +
      `- Gráficas incluidas: ${charts.length}\n\n` +
      `Puedes descargar el reporte desde el sistema.`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Limpiar filtros
  const clearFilters = () => {
    setDateRange({
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(),
    });
    setStatusFilter("todos");
    setPriorityFilter("todos");
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header con filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Datos
          </CardTitle>
          <CardDescription>
            Configura los filtros para los datos de los gráficos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rango de fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input
                type="date"
                value={dateRange.start.toISOString().slice(0, 10)}
                onChange={(e) =>
                  setDateRange((r) => ({ ...r, start: new Date(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input
                type="date"
                value={dateRange.end.toISOString().slice(0, 10)}
                onChange={(e) =>
                  setDateRange((r) => ({ ...r, end: new Date(e.target.value + 'T23:59:59') }))
                }
              />
            </div>
          </div>

          {/* Filtros adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
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
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
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

          {/* Información y acciones */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                "Cargando tickets..."
              ) : (
                `Mostrando ${filteredTickets.length} de ${tickets.length} tickets`
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
              <Button variant="outline" size="sm" onClick={loadTickets}>
                Actualizar Datos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones principales */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Gráficas Personalizadas</h2>
          <p className="text-sm text-muted-foreground">
            {charts.length === 0
              ? "Agrega gráficas para visualizar tus datos"
              : `${charts.length} gráfica${charts.length > 1 ? 's' : ''} agregada${charts.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            onClick={handleShareReport}
            disabled={charts.length === 0}
            className="flex-1 sm:flex-initial"
          >
            <Share2 className="h-4 w-4 mr-2" />
            <span>Compartir</span>
          </Button>
          <Button
            variant="outline"
            onClick={downloadFullReport}
            disabled={charts.length === 0}
            className="flex-1 sm:flex-initial"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <Button onClick={() => setIsAddChartDialogOpen(true)} className="flex-1 sm:flex-initial">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Agregar Gráfica</span>
            <span className="sm:hidden">Agregar</span>
          </Button>
        </div>
      </div>

      {/* Grid de gráficas */}
      <div className="w-full pb-6">
        {charts.length === 0 ? (
          <Card className="flex items-center justify-center min-h-[400px]">
            <CardContent className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay gráficas agregadas</h3>
              <p className="text-muted-foreground mb-6">
                Haz clic en "Agregar Gráfica" para comenzar a visualizar tus datos
              </p>
              <Button onClick={() => setIsAddChartDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Gráfica
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {charts.map((chart) => {
              const chartData = generateChartData(chart.field);
              const total = chartData.reduce((sum, item) => sum + item.value, 0);

              return (
                <Card key={chart.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {chart.type === "bar" ? (
                            <BarChart3 className="h-5 w-5" />
                          ) : (
                            <PieChartIcon className="h-5 w-5" />
                          )}
                          {chart.title}
                        </CardTitle>
                        <CardDescription>
                          {chart.type === "bar" ? "Gráfico de barras" : "Gráfico de pastel"} -{" "}
                          {total} tickets
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveChart(chart.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div id={`chart-${chart.id}`} className="w-full h-[400px]">
                      {chart.type === "bar" ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
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
                            <Bar dataKey="cantidad" fill="#8884d8" name="Cantidad">
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                              outerRadius={130}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Tabla de resumen */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">{FIELD_LABELS[chart.field]}</th>
                            <th className="text-right p-2">Cantidad</th>
                            <th className="text-right p-2">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chartData.map((item, index) => {
                            const percentage = ((item.value / total) * 100).toFixed(1);
                            return (
                              <tr key={index} className="border-t">
                                <td className="p-2">{item.name}</td>
                                <td className="text-right p-2">{item.cantidad}</td>
                                <td className="text-right p-2">{percentage}%</td>
                              </tr>
                            );
                          })}
                          <tr className="border-t font-bold bg-muted/50">
                            <td className="p-2">Total</td>
                            <td className="text-right p-2">{total}</td>
                            <td className="text-right p-2">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog para agregar gráfica */}
      <Dialog open={isAddChartDialogOpen} onOpenChange={setIsAddChartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Gráfica</DialogTitle>
            <DialogDescription>
              Selecciona el campo y tipo de gráfico que deseas visualizar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="field">Campo a Analizar *</Label>
              <Select
                value={newChart.field}
                onValueChange={(value) =>
                  setNewChart({ ...newChart, field: value as TicketField })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un campo" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {FIELD_LABELS[field]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Gráfico *</Label>
              <Select
                value={newChart.type}
                onValueChange={(value: "bar" | "pie") =>
                  setNewChart({ ...newChart, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Gráfico de Barras
                    </div>
                  </SelectItem>
                  <SelectItem value="pie">
                    <div className="flex items-center gap-2">
                      <PieChartIcon className="h-4 w-4" />
                      Gráfico de Pastel
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título del Gráfico (Opcional)</Label>
              <Input
                id="title"
                placeholder={
                  newChart.field
                    ? `Análisis de ${FIELD_LABELS[newChart.field as TicketField]}`
                    : "Título personalizado"
                }
                value={newChart.title}
                onChange={(e) => setNewChart({ ...newChart, title: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewChart({ field: "", type: "bar", title: "" });
                setIsAddChartDialogOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddChart} disabled={!newChart.field}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Gráfica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para compartir */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Compartir Reporte
            </DialogTitle>
            <DialogDescription>
              Comparte este reporte con tu equipo o genera un enlace para acceso posterior
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Información del Reporte</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Período: {dateRange.start.toLocaleDateString('es-MX')} - {dateRange.end.toLocaleDateString('es-MX')}</p>
                <p>• Total de tickets: {filteredTickets.length}</p>
                <p>• Gráficas incluidas: {charts.length}</p>
                {statusFilter !== "todos" && <p>• Filtro de estado: {mapStatus(statusFilter)}</p>}
                {priorityFilter !== "todos" && <p>• Filtro de prioridad: {mapPriority(priorityFilter)}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={copyReportLink}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copiar enlace del reporte
              </Button>
              <p className="text-xs text-muted-foreground px-1">
                Copia un enlace que recrea este reporte con las mismas gráficas y filtros
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareByEmail}
              >
                <Download className="h-4 w-4 mr-2" />
                Compartir por email
              </Button>
              <p className="text-xs text-muted-foreground px-1">
                Abre tu cliente de correo con la información del reporte
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setIsShareDialogOpen(false);
                  downloadFullReport();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar a PDF y compartir
              </Button>
              <p className="text-xs text-muted-foreground px-1">
                Descarga el reporte en PDF para compartir el archivo
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsShareDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
