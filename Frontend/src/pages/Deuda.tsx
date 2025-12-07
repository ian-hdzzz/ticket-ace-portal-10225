import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Loader2,
  DollarSign,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  FileText,
  Calendar,
  TrendingDown,
  Hash,
} from "lucide-react";
import { getDeudaJson } from "@/api/cea";

interface DeudaData {
  ciclosAnteriores: string;
  ciclosTotales: string;
  deuda: string;
  deudaComision: string;
  deudaTotal: string;
  direccion: string;
  documentoPago: string | null;
  documentoPagoAnterior: string | null;
  explotacion: string;
  nombreCliente: string;
  saldoAnterior: string;
  saldoAnteriorComision: string;
  saldoAnteriorTotal: string;
}

interface ResultadoData {
  codigoError: string;
  descripcionError: string;
}

export default function Deuda() {
  const { contratoId, explotacion } = useParams();
  const navigate = useNavigate();
  
  usePageTitle(`Deuda - Contrato ${contratoId}`, "Información de deuda y pagos");

  const [deudaData, setDeudaData] = useState<DeudaData | null>(null);
  const [resultado, setResultado] = useState<ResultadoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeuda = async () => {
      if (!contratoId || !explotacion) {
        setError("Faltan parámetros requeridos");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getDeudaJson("CONTRATO", contratoId, explotacion);
        
        console.log("Datos de deuda:", data);

        const deuda = data?.Body?.getDeudaResponse?.return?.deuda;
        const result = data?.Body?.getDeudaResponse?.return?.reultado;

        if (!deuda) {
          throw new Error("No se encontró información de deuda para este contrato");
        }

        setDeudaData(deuda);
        setResultado(result);

      } catch (e: any) {
        console.error("Error al obtener deuda:", e);
        setError(`Error al cargar deuda: ${e.message || 'Error desconocido'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeuda();
  }, [contratoId, explotacion]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Consultando deuda...</h2>
          <p className="text-muted-foreground mt-2">
            Obteniendo información financiera del contrato {contratoId}
          </p>
        </div>
      </div>
    );
  }

  if (error || !deudaData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <div className="text-center max-w-xl">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold px-8">
            {error || 'No se encontró información de deuda'}
          </h2>
          <p className="text-muted-foreground mt-3 px-12 leading-relaxed">
            {error || 'No hay información de deuda disponible para este contrato'}
          </p>
          <div className="flex gap-2 justify-center mt-6">
            <Button onClick={() => navigate(-1)}>
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const deudaTotal = parseFloat(deudaData.deudaTotal || "0");
  const deudaPrincipal = parseFloat(deudaData.deuda || "0");
  const deudaComision = parseFloat(deudaData.deudaComision || "0");
  const saldoTotal = parseFloat(deudaData.saldoAnteriorTotal || "0");
  const tieneDeuda = deudaTotal > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Estado de Cuenta</h1>
          <p className="text-muted-foreground">Contrato: {contratoId} | Explotación: {explotacion}</p>
        </div>
        {resultado && resultado.codigoError === "0" && (
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Consulta Exitosa
          </Badge>
        )}
      </div>

      {/* Estado de Deuda Alert */}
      {tieneDeuda ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este contrato tiene una deuda pendiente de <strong>${deudaTotal.toFixed(2)}</strong>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Este contrato no tiene deuda pendiente
          </AlertDescription>
        </Alert>
      )}

      {/* Información del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Nombre del Cliente</p>
              <p className="font-medium">{deudaData.nombreCliente}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Explotación</p>
              <Badge variant="secondary" className="font-mono">
                {deudaData.explotacion}
              </Badge>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Dirección de Suministro</p>
              <div className="flex items-start gap-2 mt-1">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="font-medium">{deudaData.direccion}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Deuda Actual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Deuda Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm text-muted-foreground">Deuda Principal</span>
                <span className={`text-lg font-bold ${deudaPrincipal > 0 ? 'text-destructive' : 'text-success'}`}>
                  ${deudaPrincipal.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm text-muted-foreground">Comisiones</span>
                <span className={`text-lg font-bold ${deudaComision > 0 ? 'text-destructive' : 'text-success'}`}>
                  ${deudaComision.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2 bg-accent/50 p-3 rounded-lg">
                <span className="font-semibold">Deuda Total</span>
                <span className={`text-2xl font-bold ${deudaTotal > 0 ? 'text-destructive' : 'text-success'}`}>
                  ${deudaTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Ciclos Anteriores</p>
                <p className="text-2xl font-bold">{deudaData.ciclosAnteriores}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Ciclos Totales</p>
                <p className="text-2xl font-bold">{deudaData.ciclosTotales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saldo Anterior */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Saldo Anterior
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm text-muted-foreground">Saldo Principal</span>
                <span className="text-lg font-semibold">
                  ${parseFloat(deudaData.saldoAnterior || "0").toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm text-muted-foreground">Comisiones</span>
                <span className="text-lg font-semibold">
                  ${parseFloat(deudaData.saldoAnteriorComision || "0").toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2 bg-accent/50 p-3 rounded-lg">
                <span className="font-semibold">Saldo Total Anterior</span>
                <span className="text-2xl font-bold">
                  ${saldoTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentos de Pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos de Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Documento de Pago Actual</p>
              {deudaData.documentoPago ? (
                <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium font-mono">{deudaData.documentoPago}</span>
                </div>
              ) : (
                <p className="text-muted-foreground italic p-3 bg-muted/50 rounded-lg">
                  No disponible
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Documento de Pago Anterior</p>
              {deudaData.documentoPagoAnterior ? (
                <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium font-mono">{deudaData.documentoPagoAnterior}</span>
                </div>
              ) : (
                <p className="text-muted-foreground italic p-3 bg-muted/50 rounded-lg">
                  No disponible
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      {tieneDeuda && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones Recomendadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Alert>
              <TrendingDown className="h-4 w-4" />
              <AlertDescription>
                Se recomienda realizar el pago de la deuda pendiente para evitar cargos adicionales o suspensión del servicio.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" variant="default">
                <DollarSign className="h-4 w-4 mr-2" />
                Generar Recibo de Pago
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => navigate(`/dashboard/contratos/detail/${contratoId}`)}>
                <FileText className="h-4 w-4 mr-2" />
                Ver Detalles del Contrato
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
