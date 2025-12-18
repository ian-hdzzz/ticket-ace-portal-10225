import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, DollarSign, AlertCircle, Droplet, Settings, Info, Calendar } from "lucide-react";
import { getTarifaDeAguaPorContratoJson } from "@/api/cea";

interface Corrector {
  descripcion: string;
}

interface Subconcepto {
  descripcion: string;
  correctoresAplicables: {
    Corrector: Corrector[];
  };
}

interface Variable {
  id: string;
  descripcion: string;
  valor: string;
}

interface Tarifa {
  codigo: {
    id1: string;
    id2: string;
    id3: string;
  };
  descripcion: string;
  publicacion: {
    fechaPublicacion: string;
    textoPublicacion: string;
  };
  subconceptos: Subconcepto[];
  variablesContratos: Variable[];
  variablesPuntoServicio: Variable[] | null;
}

interface ContratoTarifasTabProps {
  numeroContrato: string;
  explotacion: string;
}

export default function ContratoTarifasTab({ numeroContrato, explotacion }: ContratoTarifasTabProps) {
  const [tarifa, setTarifa] = useState<Tarifa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTarifas = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('[ContratoTarifasTab] Iniciando llamada con:', { numeroContrato, explotacion });
        
        const data = await getTarifaDeAguaPorContratoJson(explotacion, numeroContrato);
        console.log('[ContratoTarifasTab] ===== ANÁLISIS DE RESPUESTA =====');
        console.log('[ContratoTarifasTab] Datos JSON recibidos:', data);
        console.log('[ContratoTarifasTab] Tipo de data:', typeof data);
        console.log('[ContratoTarifasTab] Es null?:', data === null);
        console.log('[ContratoTarifasTab] Es undefined?:', data === undefined);
        console.log('[ContratoTarifasTab] Es objeto?:', typeof data === 'object');
        console.log('[ContratoTarifasTab] JSON.stringify:', JSON.stringify(data));

        // Verificar si la respuesta está vacía o es null
        if (!data || data === null || (typeof data === 'string' && data.trim() === '')) {
          console.error('[ContratoTarifasTab] ❌ La API devolvió una respuesta vacía o null');
          throw new Error("La API no devolvió datos. El contrato podría no tener tarifa asignada o los parámetros son incorrectos.");
        }

        // Intentar múltiples rutas posibles para los datos
        let tarifaRaw = data;
        
        // Si los datos vienen envueltos en otras capas, intentar extraerlos
        if (data && typeof data === 'object') {
          console.log('[ContratoTarifasTab] Explorando estructura de datos...');
          const keys = Object.keys(data);
          console.log('[ContratoTarifasTab] Keys disponibles:', keys);
          console.log('[ContratoTarifasTab] Número de keys:', keys.length);
          
          if (keys.length === 0) {
            console.error('[ContratoTarifasTab] ❌ El objeto está vacío (0 keys)');
            console.error('[ContratoTarifasTab] Esto podría indicar:');
            console.error('[ContratoTarifasTab]   1. El contrato no tiene tarifa asignada');
            console.error('[ContratoTarifasTab]   2. La explotación es incorrecta');
            console.error('[ContratoTarifasTab]   3. Error en el parsing del XML');
            throw new Error("La respuesta está vacía. Verifica el número de contrato y explotación.");
          }
          
          // Posibles rutas donde puede estar la data
          const possiblePaths = [
            data,
            data.getTarifaDeAguaPorContratoReturn,
            data.return,
            data.Body?.getTarifaDeAguaPorContratoResponse?.getTarifaDeAguaPorContratoReturn,
            data.Body?.getTarifaDeAguaPorContratoReturn,
            data.getTarifaDeAguaPorContratoResponse?.getTarifaDeAguaPorContratoReturn
          ];
          
          for (let i = 0; i < possiblePaths.length; i++) {
            const path = possiblePaths[i];
            console.log(`[ContratoTarifasTab] Verificando ruta ${i}:`, path);
            if (path && typeof path === 'object' && (path.codigo || path.descripcion || path.subconceptos)) {
              console.log(`[ContratoTarifasTab] ✓ Datos encontrados en ruta ${i}`);
              tarifaRaw = path;
              break;
            }
          }
        }

        console.log('[ContratoTarifasTab] Tarifa raw seleccionada:', tarifaRaw);

        if (!tarifaRaw || typeof tarifaRaw !== 'object') {
          console.error('[ContratoTarifasTab] ERROR: No se encontró tarifa válida');
          console.error('[ContratoTarifasTab] Estructura completa recibida:', JSON.stringify(data, null, 2));
          throw new Error("No se encontraron tarifas para este contrato");
        }

        // Extraer subconceptos
        const subconceptosRaw = tarifaRaw.subconceptos?.Subconcepto;
        const subconceptosArray = subconceptosRaw 
          ? (Array.isArray(subconceptosRaw) ? subconceptosRaw : [subconceptosRaw])
          : [];

        const subconceptos = subconceptosArray.map((sub: any) => {
          const correctoresRaw = sub.correctoresAplicables?.Corrector;
          const correctoresArray = correctoresRaw
            ? (Array.isArray(correctoresRaw) ? correctoresRaw : [correctoresRaw])
            : [];

          return {
            descripcion: sub.descripcion || "",
            correctoresAplicables: {
              Corrector: correctoresArray.map((c: any) => ({
                descripcion: c.descripcion || "",
              })),
            },
          };
        });

        // Extraer variables del contrato
        const variablesRaw = tarifaRaw.variablesContratos?.Variable;
        const variablesArray = variablesRaw
          ? (Array.isArray(variablesRaw) ? variablesRaw : [variablesRaw])
          : [];

        const variablesContratos = variablesArray.map((v: any) => ({
          id: v.id || "",
          descripcion: v.descripcion || "",
          valor: v.valor || "",
        }));

        // Extraer variables del punto de servicio
        const variablesPSRaw = tarifaRaw.variablesPuntoServicio?.Variable;
        const variablesPSArray = variablesPSRaw
          ? (Array.isArray(variablesPSRaw) ? variablesPSRaw : [variablesPSRaw])
          : [];

        const variablesPuntoServicio = variablesPSArray.length > 0 
          ? variablesPSArray.map((v: any) => ({
              id: v.id || "",
              descripcion: v.descripcion || "",
              valor: v.valor || "",
            }))
          : null;

        const tarifaTransformada: Tarifa = {
          codigo: {
            id1: tarifaRaw.codigo?.id1Short || "",
            id2: tarifaRaw.codigo?.id2Short || "",
            id3: tarifaRaw.codigo?.id3Short || "",
          },
          descripcion: tarifaRaw.descripcion || "Tarifa sin descripción",
          publicacion: {
            fechaPublicacion: tarifaRaw.publicacion?.fechaPublicacion || "",
            textoPublicacion: tarifaRaw.publicacion?.textoPublicacion || "",
          },
          subconceptos,
          variablesContratos,
          variablesPuntoServicio,
        };

        setTarifa(tarifaTransformada);

      } catch (e: any) {
        console.error("Error al obtener tarifas:", e);
        console.error("Stack trace:", e.stack);
        setError(e.message || "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTarifas();
  }, [numeroContrato, explotacion]);

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando tarifas...</p>
        </div>
      </div>
    );
  }

  if (error || !tarifa) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || "No se encontraron tarifas para este contrato"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información Principal de la Tarifa */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarifa Aplicada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{tarifa.descripcion}</div>
            <p className="text-xs text-muted-foreground">
              Código: {tarifa.codigo.id1}-{tarifa.codigo.id2}-{tarifa.codigo.id3}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicación</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {tarifa.publicacion.fechaPublicacion 
                ? new Date(tarifa.publicacion.fechaPublicacion).toLocaleDateString('es-MX')
                : 'No disponible'}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {tarifa.publicacion.textoPublicacion || 'Sin información'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tarifa.subconceptos.length}</div>
            <p className="text-xs text-muted-foreground">
              Tipos de servicio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subconceptos y Servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios Incluidos</CardTitle>
          <CardDescription>
            Conceptos que se facturan bajo esta tarifa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tarifa.subconceptos.map((subconcepto, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-primary" />
                    {subconcepto.descripcion}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Servicio {index + 1} de {tarifa.subconceptos.length}
                  </p>
                </div>
                <Badge variant="outline">
                  {subconcepto.correctoresAplicables.Corrector.length} correctores
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Correctores y Políticas Aplicables:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subconcepto.correctoresAplicables.Corrector.map((corrector, cIndex) => (
                    <div key={cIndex} className="flex items-start gap-2 text-sm p-2 bg-accent/50 rounded">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{corrector.descripcion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Variables del Contrato */}
      {tarifa.variablesContratos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variables del Contrato</CardTitle>
            <CardDescription>
              Parámetros específicos aplicados a este contrato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tarifa.variablesContratos.map((variable, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        <Badge variant="secondary">{variable.id}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {variable.descripcion}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {variable.valor}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variables del Punto de Servicio */}
      {tarifa.variablesPuntoServicio && tarifa.variablesPuntoServicio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variables del Punto de Servicio</CardTitle>
            <CardDescription>
              Parámetros específicos del punto de suministro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tarifa.variablesPuntoServicio.map((variable, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        <Badge variant="secondary">{variable.id}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {variable.descripcion}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {variable.valor}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información sobre la Tarifa */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre la Estructura Tarifaria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Nota:</strong> La tarifa "{tarifa.descripcion}" aplica para este contrato. 
              Los correctores y políticas mostrados arriba determinan cómo se calculan los montos 
              en cada facturación según el consumo y las características del servicio.
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• <strong>Correctores:</strong> Son reglas que ajustan el cálculo del importe (descuentos, recargos, políticas especiales)</p>
            <p>• <strong>Variables del contrato:</strong> Parámetros únicos de este contrato que afectan la facturación</p>
            <p>• <strong>Servicios incluidos:</strong> Conceptos que se facturan bajo esta tarifa (agua potable, refacturas, etc.)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
