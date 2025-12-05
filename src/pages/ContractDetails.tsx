import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  FileText,
  Loader2,
  Building,
  Phone,
  Mail,
  DollarSign,
  Droplet,
  CreditCard,
  Hash,
} from "lucide-react";
import { supabase } from '../supabase/client.ts';
import { toast } from "sonner";

export default function ContractDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Establecer título de la página
  const [pageTitle, setPageTitle] = useState("Detalles del Contrato");
  usePageTitle(pageTitle, "Información completa del contrato");

  // Estados para manejo de datos
  const [contract, setContract] = useState<any>(null);
  const [isLoadingContract, setIsLoadingContract] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener contrato específico desde la API de CEA
  const getContractById = async (contractId: string) => {
    setIsLoadingContract(true);
    setError(null);

    try {
      const { consultaDetalleContratoJson } = await import("@/api/cea");
      const data = await consultaDetalleContratoJson(contractId);
      
      console.log("Datos del contrato:", data);

      const contratoData = data?.GenericoContratoDTO;
      
      if (!contratoData || !contratoData.contrato) {
        throw new Error("No se encontró información del contrato");
      }

      const contrato = contratoData.contrato;
      const puntoSuministro = contratoData.puntoSuministro;
      const datosPersonales = contratoData.datosPersonales;
      const datosPago = contratoData.datosPago;

      // Construir dirección completa
      const direccionCompleta = puntoSuministro 
        ? `${puntoSuministro.calle || ''} ${puntoSuministro.numero || ''} ${puntoSuministro.bloque || ''} ${puntoSuministro.planta || ''}, ${puntoSuministro.municipio || ''}, ${puntoSuministro.provincia || ''}`.trim()
        : 'No especificada';

      const transformedContract = {
        id: contractId,
        numero_contrato: contrato.numeroContrato || contractId,
        titular: contrato.titular || datosPersonales?.titular || 'Sin titular',
        direccion: direccionCompleta,
        colonia: puntoSuministro?.municipio || 'No especificada',
        ciudad: puntoSuministro?.provincia || 'No especificada',
        estado: contrato.fechaBaja ? 'inactivo' : 'activo',
        fecha_inicio: contrato.fechaAlta,
        fecha_baja: contrato.fechaBaja,
        correo: datosPersonales?.email || null,
        telefono: datosPersonales?.telefono1 || null,
        telefono2: datosPersonales?.telefono2 || null,
        nif: datosPersonales?.cifNif || null,
        tipo_uso: contrato.descUso || 'No especificado',
        explotacion: contrato.explotacion || 'No disponible',
        numero_contador: contrato.numeroContador || 'No disponible',
        telelectura: contrato.telelectura === 'true',
        direccion_facturacion: datosPago?.direccionFacturacion || direccionCompleta,
        forma_pago: datosPago?.formaPago || 'No especificada',
        // Datos del contador
        contador_serie: puntoSuministro?.listaDeContadores?.ContratoContadorDTO?.numeroSerie || contrato.numeroContador,
        contador_estado: puntoSuministro?.listaDeContadores?.ContratoContadorDTO?.estadoContador,
        contador_fecha_instalacion: puntoSuministro?.listaDeContadores?.ContratoContadorDTO?.fechaInstalacion,
        contador_fecha_baja: puntoSuministro?.listaDeContadores?.ContratoContadorDTO?.fechaBaja,
        // Plan de pago
        tiene_plan_pago: contrato.tienePlanPago === 'S',
        // Datos completos para referencia
        rawData: data,
      };

      setContract(transformedContract);
      setPageTitle(`Contrato ${transformedContract.numero_contrato}`);

    } catch (e: any) {
      console.error('Error al obtener contrato:', e);
      setError(`Error al cargar el contrato: ${e.message || 'Error desconocido'}`);
    } finally {
      setIsLoadingContract(false);
    }
  };

  // Cargar contrato al montar el componente
  useEffect(() => {
    if (id) {
      getContractById(id);
    } else {
      setError('No se proporcionó un ID de contrato válido');
      setIsLoadingContract(false);
    }
  }, [id]);

  if (isLoadingContract) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Cargando contrato...</h2>
          <p className="text-muted-foreground mt-2">
            Obteniendo información desde la base de datos
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ID: {id}
          </p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {error || 'Contrato no encontrado'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {error || 'El contrato que buscas no existe en la base de datos'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ID buscado: {id}
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button onClick={() => navigate(-1)}>
              Volver
            </Button>
            <Button
              variant="outline"
              onClick={() => id && getContractById(id)}
            >
              Reintentar
            </Button>
          </div>
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
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Contrato #{contract.numero_contrato}</h1>
          <p className="text-muted-foreground">{contract.titular}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default">
            {contract.estado === "activo" ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información del Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Número de Contrato</p>
                  <p className="font-medium font-mono">{contract.numero_contrato}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Explotación</p>
                  <p className="font-medium">{contract.explotacion}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Titular</p>
                  <p className="font-medium">{contract.titular}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIF/RFC</p>
                  <p className="font-medium font-mono">{contract.nif || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Uso</p>
                  <Badge variant="outline">{contract.tipo_uso}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant={contract.estado === "activo" ? "default" : "secondary"}>
                    {contract.estado === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Alta</p>
                  <p className="font-medium">
                    {contract.fecha_inicio ? new Date(contract.fecha_inicio).toLocaleDateString("es-MX") : 'No disponible'}
                  </p>
                </div>
                {contract.fecha_baja && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Baja</p>
                    <p className="font-medium text-destructive">
                      {new Date(contract.fecha_baja).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                )}
                {contract.tiene_plan_pago && (
                  <div className="md:col-span-2">
                    <Badge variant="secondary" className="gap-1">
                      <CreditCard className="h-3 w-3" />
                      Tiene Plan de Pago Activo
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Punto de Suministro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">{contract.direccion}</p>
              <p className="text-sm text-muted-foreground">
                {contract.colonia}, {contract.ciudad}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5" />
                Información del Contador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Número de Serie</p>
                  <p className="font-medium font-mono">{contract.contador_serie}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant={contract.contador_estado === "1" ? "default" : "secondary"}>
                    {contract.contador_estado === "1" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                {contract.contador_fecha_instalacion && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Instalación</p>
                    <p className="font-medium">
                      {new Date(contract.contador_fecha_instalacion).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Telelectura</p>
                  <Badge variant={contract.telelectura ? "default" : "outline"}>
                    {contract.telelectura ? "Sí" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Datos de Facturación y Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Dirección de Facturación</p>
                <p className="font-medium">{contract.direccion_facturacion}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Forma de Pago</p>
                <p className="font-medium">{contract.forma_pago}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Historial de Servicios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Próximamente: historial de tickets y órdenes de trabajo asociadas a este contrato.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.correo ? (
                <>
                  <div className="flex items-start gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block">Email:</span>
                      <span className="font-medium break-all">{contract.correo}</span>
                    </div>
                  </div>
                  <Separator />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email: No disponible</span>
                  </div>
                  <Separator />
                </>
              )}
              {contract.telefono && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Teléfono 1:</span>
                      <p className="font-medium font-mono">{contract.telefono}</p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}
              {contract.telefono2 && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Teléfono 2:</span>
                      <p className="font-medium font-mono">{contract.telefono2}</p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}
              {!contract.telefono && !contract.telefono2 && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Teléfono: No disponible</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full gap-2"
                variant="default"
                onClick={() => {
                  // Navegar a crear ticket con el contrato prellenado
                  navigate(`/dashboard/tickets/new?contract=${contract.numero_contrato}`);
                }}
              >
                <FileText className="h-4 w-4" />
                Crear Ticket
              </Button>
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={async () => {
                  try {
                    const { getDeudaJson } = await import("@/api/cea");
                    toast.loading("Consultando deuda...");
                    const deuda = await getDeudaJson("CONTRATO", contract.numero_contrato, contract.explotacion);
                    console.log("Deuda:", deuda);
                    toast.success("Deuda consultada (ver consola)");
                  } catch (e: any) {
                    toast.error(`Error al consultar deuda: ${e.message}`);
                  }
                }}
              >
                <DollarSign className="h-4 w-4" />
                Ver Deuda
              </Button>
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={() => {
                  navigate(`/dashboard/lecturas/${contract.numero_contrato}/${contract.explotacion}`);
                }}
              >
                <Droplet className="h-4 w-4" />
                Ver Lecturas
              </Button>
              <Separator />
              <Button
                className="w-full"
                variant="outline"
                onClick={() => id && getContractById(id)}
              >
                Actualizar Datos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
