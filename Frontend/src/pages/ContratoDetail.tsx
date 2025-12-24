import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  FileText,
  Loader2,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Hash,
  Droplet,
  DollarSign,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { consultaDetalleContratoJson } from "@/api/cea";
import { toast } from "sonner";

// Sub-componentes para cada tab
import ContratoInfoTab from "@/components/contrato/ContratoInfoTab";
import ContratoConsumosTab from "@/components/contrato/ContratoConsumosTab";
import ContratoTarifasTab from "@/components/contrato/ContratoTarifasTab";
import ContratoFinancieroTab from "@/components/contrato/ContratoFinancieroTab";

interface ContratoData {
  numeroContrato: string;
  explotacion: string;
  titular: string;
  direccion: string;
  telefono?: string;
  email?: string;
  tipoUso: string;
  descUso: string;
  numeroContador: string;
  fechaAlta: string;
  fechaBaja: string | null;
  estado: "activo" | "inactivo";
  rawData: any;
}

export default function ContratoDetail() {
  const { contratoId } = useParams();
  const navigate = useNavigate();
  
  const [contrato, setContrato] = useState<ContratoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  usePageTitle(
    contrato ? `Contrato ${contrato.numeroContrato}` : "Detalle de Contrato",
    "Información completa del contrato"
  );

  useEffect(() => {
    const fetchContrato = async () => {
      if (!contratoId) {
        setError("No se especificó un número de contrato");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Intentar obtener explotación desde localStorage o usar "1" por defecto
        const explotacion = localStorage.getItem(`contrato_${contratoId}_explotacion`) || "1";
        
        const data = await consultaDetalleContratoJson(contratoId);
        console.log("Datos del contrato:", data);

        const contratoData = data?.GenericoContratoDTO;
        
        if (!contratoData || !contratoData.contrato) {
          throw new Error("No se encontró información del contrato");
        }

        const contratoInfo = contratoData.contrato;
        const puntoSuministro = contratoData.puntoSuministro;
        const datosPersonales = contratoData.datosPersonales;

        // Construir dirección completa
        const direccion = puntoSuministro 
          ? `${puntoSuministro.calle || ''} ${puntoSuministro.numero || ''} ${puntoSuministro.bloque || ''} ${puntoSuministro.planta || ''}, ${puntoSuministro.municipio || ''}, ${puntoSuministro.provincia || ''}`.trim()
          : 'No especificada';

        const contratoComplete: ContratoData = {
          numeroContrato: contratoInfo.numeroContrato || contratoId,
          explotacion: explotacion || contratoInfo.explotacion || '1',
          titular: contratoInfo.titular || datosPersonales?.titular || 'Sin titular',
          direccion,
          telefono: datosPersonales?.telefono1 || undefined,
          email: datosPersonales?.email || undefined,
          tipoUso: contratoInfo.tipoUso || '',
          descUso: contratoInfo.descUso || 'No especificado',
          numeroContador: contratoInfo.numeroContador || 'No disponible',
          fechaAlta: contratoInfo.fechaAlta ? new Date(contratoInfo.fechaAlta).toLocaleDateString('es-MX') : 'No disponible',
          fechaBaja: contratoInfo.fechaBaja ? new Date(contratoInfo.fechaBaja).toLocaleDateString('es-MX') : null,
          estado: contratoInfo.fechaBaja ? 'inactivo' : 'activo',
          rawData: data,
        };

        setContrato(contratoComplete);

      } catch (err: any) {
        console.error("Error al cargar contrato:", err);
        setError(err.message || "Error desconocido al cargar el contrato");
        toast.error(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContrato();
  }, [contratoId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Cargando contrato...</h2>
          <p className="text-muted-foreground mt-2">
            Obteniendo información del contrato {contratoId}
          </p>
        </div>
      </div>
    );
  }

  if (error || !contrato) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <div className="text-center max-w-xl">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold px-8">
            {error || 'No se encontró el contrato'}
          </h2>
          <p className="text-muted-foreground mt-3 px-12 leading-relaxed">
            {error || 'No hay información disponible para este contrato'}
          </p>
          <div className="flex gap-2 justify-center mt-6">
            <Button onClick={() => navigate(-1)}>
              Volver
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/contratos')}>
              Ir a Contratos
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Contrato {contrato.numeroContrato}</h1>
            <Badge variant={contrato.estado === "activo" ? "default" : "secondary"}>
              {contrato.estado === "activo" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {contrato.titular} · Explotación: {contrato.explotacion}
          </p>
        </div>
      </div>

      {/* Información Rápida */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipo de Uso</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{contrato.descUso}</div>
            <p className="text-xs text-muted-foreground">Código: {contrato.tipoUso}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contador</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold font-mono">{contrato.numeroContador}</div>
            <p className="text-xs text-muted-foreground">Número de serie</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fecha Alta</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{contrato.fechaAlta}</div>
            <p className="text-xs text-muted-foreground">
              {contrato.fechaBaja ? `Baja: ${contrato.fechaBaja}` : 'Contrato vigente'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ubicación</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium line-clamp-2">{contrato.direccion}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info" className="gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <User className="h-4 w-4" />
            Información
          </TabsTrigger>
          <TabsTrigger value="consumos" className="gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Droplet className="h-4 w-4" />
            Consumos
          </TabsTrigger>
          <TabsTrigger value="tarifas" className="gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <DollarSign className="h-4 w-4" />
            Tarifas
          </TabsTrigger>
          <TabsTrigger value="financiero" className="gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4" />
            Financiero
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ContratoInfoTab contrato={contrato} />
        </TabsContent>

        <TabsContent value="consumos">
          <ContratoConsumosTab 
            numeroContrato={contrato.numeroContrato} 
            explotacion={contrato.explotacion}
          />
        </TabsContent>

        <TabsContent value="tarifas">
          <ContratoTarifasTab 
            numeroContrato={contrato.numeroContrato} 
            explotacion={contrato.explotacion}
          />
        </TabsContent>

        <TabsContent value="financiero">
          <ContratoFinancieroTab 
            numeroContrato={contrato.numeroContrato} 
            explotacion={contrato.explotacion}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
