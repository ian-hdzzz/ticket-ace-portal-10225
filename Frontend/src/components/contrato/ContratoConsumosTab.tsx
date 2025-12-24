import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Loader2, Droplet, TrendingUp, TrendingDown, Calendar, AlertCircle } from "lucide-react";
import { getConsumos, xmlToJson } from "@/api/cea";
import { useConceptos, getConceptoDescripcion } from "@/hooks/useConceptos";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Consumo {
  año: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  metrosCubicos: number;
  importeTotal: number;
  conceptos: {
    id1: string;
    id2: string;
    descripcion: string;
    importe: number;
  }[];
}

interface ContratoConsumosTabProps {
  numeroContrato: string;
  explotacion: string;
}

export default function ContratoConsumosTab({ numeroContrato, explotacion }: ContratoConsumosTabProps) {
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("todos");
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  const { conceptos, isLoading: loadingConceptos } = useConceptos(explotacion);

  useEffect(() => {
    const fetchConsumos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const xmlDoc = await getConsumos(explotacion, numeroContrato);
        const data = xmlToJson(xmlDoc);

        console.log("Datos de consumos completos:", data);
        console.log("Body:", data?.Body);
        console.log("getConsumosResponse:", data?.Body?.getConsumosResponse);
        console.log("getConsumosReturn:", data?.Body?.getConsumosResponse?.getConsumosReturn);

        // Intentar múltiples rutas posibles para los datos
        let consumosRaw = data?.Body?.getConsumosResponse?.getConsumosReturn?.Consumo;
        
        // Si no encuentra, intentar otras rutas posibles
        if (!consumosRaw) {
          consumosRaw = data?.getConsumosResponse?.getConsumosReturn?.Consumo;
        }
        if (!consumosRaw) {
          consumosRaw = data?.getConsumosReturn?.Consumo;
        }
        if (!consumosRaw) {
          consumosRaw = data?.Consumo;
        }

        console.log("Consumos raw encontrados:", consumosRaw);

        if (!consumosRaw) {
          console.error("Estructura de datos recibida:", JSON.stringify(data, null, 2));
          throw new Error("No se encontraron consumos para este contrato");
        }

        const consumosArray = Array.isArray(consumosRaw) ? consumosRaw : [consumosRaw];

        const consumosTransformados: Consumo[] = consumosArray
          .map((c: any) => {
            // Extraer conceptos del consumo
            const conceptosRaw = c.conceptos?.Concepto;
            const conceptosArray = conceptosRaw 
              ? (Array.isArray(conceptosRaw) ? conceptosRaw : [conceptosRaw])
              : [];

            const conceptos = conceptosArray.map((concepto: any) => ({
              id1: concepto.codigoConcepto?.id1Short || "",
              id2: concepto.codigoConcepto?.id2Short || "",
              descripcion: concepto.descripcionConcepto || "",
              importe: parseFloat(concepto.importe || "0"),
            }));

            const importeTotal = conceptos.reduce((sum, con) => sum + con.importe, 0);

            return {
              año: c.año || "",
              periodo: c.periodo?.replace(/<|>/g, '') || "",
              fechaInicio: c.fechaInicio || "",
              fechaFin: c.fechaFin || "",
              metrosCubicos: parseInt(c.metrosCubicos || "0"),
              importeTotal,
              conceptos,
            };
          })
          .sort((a, b) => {
            // Ordenar por año descendente, luego por período
            if (a.año !== b.año) {
              return parseInt(b.año) - parseInt(a.año);
            }
            return b.periodo.localeCompare(a.periodo);
          });

        setConsumos(consumosTransformados);

        // Extraer años únicos
        const years = [...new Set(consumosTransformados.map(c => c.año))].sort((a, b) => parseInt(b) - parseInt(a));
        setAvailableYears(years);

      } catch (e: any) {
        console.error("Error al obtener consumos:", e);
        console.error("Stack trace:", e.stack);
        setError(e.message || "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsumos();
  }, [numeroContrato, explotacion]);

  // Filtrar consumos por año
  const consumosFiltrados = selectedYear === "todos" 
    ? consumos 
    : consumos.filter(c => c.año === selectedYear);

  // Calcular estadísticas
  const stats = {
    promedio: consumosFiltrados.length > 0 
      ? Math.round(consumosFiltrados.reduce((sum, c) => sum + c.metrosCubicos, 0) / consumosFiltrados.length)
      : 0,
    maximo: Math.max(...consumosFiltrados.map(c => c.metrosCubicos), 0),
    minimo: consumosFiltrados.length > 0 
      ? Math.min(...consumosFiltrados.filter(c => c.metrosCubicos > 0).map(c => c.metrosCubicos))
      : 0,
    totalImporte: consumosFiltrados.reduce((sum, c) => sum + c.importeTotal, 0),
  };

  // Datos para el gráfico
  const chartData = [...consumosFiltrados]
    .reverse()
    .slice(-12)
    .map(c => ({
      periodo: c.periodo,
      consumo: c.metrosCubicos,
      importe: c.importeTotal,
    }));

  if (isLoading || loadingConceptos) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando consumos...</p>
        </div>
      </div>
    );
  }

  if (error || consumos.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || "No se encontraron consumos para este contrato"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro por año */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filtrar por año:</label>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los años</SelectItem>
            {availableYears.map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Mensual</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.promedio} m³</div>
            <p className="text-xs text-muted-foreground">
              {consumosFiltrados.length} períodos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Máximo</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maximo} m³</div>
            <p className="text-xs text-muted-foreground">Pico registrado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Mínimo</CardTitle>
            <TrendingDown className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.minimo} m³</div>
            <p className="text-xs text-muted-foreground">Menor consumo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Importe Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalImporte.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Suma de períodos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución del Consumo e Importes</CardTitle>
          <CardDescription>Últimos 12 períodos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="periodo" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                />
                <YAxis yAxisId="left" label={{ value: 'm³', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: '$', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="consumo" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Consumo (m³)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="importe" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Importe ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Consumos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Consumos ({consumosFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead className="text-right">Consumo (m³)</TableHead>
                  <TableHead className="text-right">Importe Total</TableHead>
                  <TableHead>Conceptos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumosFiltrados.map((consumo, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{consumo.periodo}</TableCell>
                    <TableCell className="text-sm">
                      <div>{new Date(consumo.fechaInicio).toLocaleDateString('es-MX')}</div>
                      <div className="text-muted-foreground">
                        → {new Date(consumo.fechaFin).toLocaleDateString('es-MX')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {consumo.metrosCubicos}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${consumo.importeTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {consumo.conceptos.slice(0, 3).map((concepto, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {concepto.descripcion || getConceptoDescripcion(conceptos, concepto.id1, concepto.id2)}
                          </Badge>
                        ))}
                        {consumo.conceptos.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{consumo.conceptos.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
