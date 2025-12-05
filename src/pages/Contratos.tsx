import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  FileText,
  Loader2,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Hash,
} from "lucide-react";
import { consultaDetalleContratoJson } from "@/api/cea";
import { toast } from "sonner";

interface ContratoInfo {
  numeroContrato: string;
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
  explotacion: string;
  rawData: any;
}

export default function Contratos() {
  const navigate = useNavigate();
  usePageTitle("Contratos", "Búsqueda y gestión de contratos");

  const [searchQuery, setSearchQuery] = useState("");
  const [explotacionQuery, setExplotacionQuery] = useState("1");
  const [isSearching, setIsSearching] = useState(false);
  const [contratos, setContratos] = useState<ContratoInfo[]>([]);
  const [lastSearchedContract, setLastSearchedContract] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Por favor ingresa un número de contrato");
      return;
    }

    setIsSearching(true);
    try {
      const data = await consultaDetalleContratoJson(searchQuery.trim());
      console.log("Datos del contrato:", data);

      // Extraer información del objeto GenericoContratoDTO
      const contratoData = data?.GenericoContratoDTO;
      
      if (!contratoData || !contratoData.contrato) {
        toast.error("No se encontró información del contrato");
        return;
      }

      const contrato = contratoData.contrato;
      const puntoSuministro = contratoData.puntoSuministro;
      const datosPersonales = contratoData.datosPersonales;

      // Construir dirección completa
      const direccion = puntoSuministro 
        ? `${puntoSuministro.calle || ''} ${puntoSuministro.numero || ''} ${puntoSuministro.bloque || ''} ${puntoSuministro.planta || ''}, ${puntoSuministro.municipio || ''}, ${puntoSuministro.provincia || ''}`.trim()
        : 'No especificada';

      const contratoInfo: ContratoInfo = {
        numeroContrato: contrato.numeroContrato || searchQuery,
        titular: contrato.titular || datosPersonales?.titular || 'Sin titular',
        direccion,
        telefono: datosPersonales?.telefono1 || null,
        email: datosPersonales?.email || null,
        tipoUso: contrato.tipoUso || '',
        descUso: contrato.descUso || 'No especificado',
        numeroContador: contrato.numeroContador || 'No disponible',
        fechaAlta: contrato.fechaAlta ? new Date(contrato.fechaAlta).toLocaleDateString('es-MX') : 'No disponible',
        fechaBaja: contrato.fechaBaja ? new Date(contrato.fechaBaja).toLocaleDateString('es-MX') : null,
        estado: contrato.fechaBaja ? 'inactivo' : 'activo',
        explotacion: explotacionQuery || contrato.explotacion || '1',
        rawData: data,
      };

      // Si es el mismo contrato, reemplazar; si no, agregar a la lista
      setContratos(prev => {
        const exists = prev.find(c => c.numeroContrato === contratoInfo.numeroContrato);
        if (exists) {
          return prev.map(c => c.numeroContrato === contratoInfo.numeroContrato ? contratoInfo : c);
        }
        return [contratoInfo, ...prev];
      });

      setLastSearchedContract(contratoInfo.numeroContrato);
      toast.success(`Contrato ${contratoInfo.numeroContrato} cargado correctamente`);

    } catch (error: any) {
      console.error("Error al buscar contrato:", error);
      toast.error(`Error al buscar contrato: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ingresa el número de contrato (ej: 523161)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9"
                disabled={isSearching}
              />
            </div>
            <div className="relative w-40">
              <Input
                placeholder="Explotación (ej: 01)"
                placeholder="Número de contrato"
                value={explotacionQuery}
                onChange={(e) => setExplotacionQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
                maxLength={2}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim() || !explotacionQuery.trim()}
              className="gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Busca contratos por número y explotación para ver su información detallada
          </p>
        </CardContent>
      </Card>

      {/* Resultados */}
      {contratos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contratos Encontrados ({contratos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Contrato</TableHead>
                    <TableHead>Explotación</TableHead>
                    <TableHead>Titular</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Tipo de Uso</TableHead>
                    <TableHead>Contador</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratos.map((contrato) => (
                    <TableRow
                      key={contrato.numeroContrato}
                      className={lastSearchedContract === contrato.numeroContrato ? "bg-accent/50" : ""}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          {contrato.numeroContrato}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {contrato.explotacion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{contrato.titular}</p>
                            {contrato.telefono && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contrato.telefono}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2 max-w-xs">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm line-clamp-2">{contrato.direccion}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {contrato.descUso}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {contrato.numeroContador}
                      </TableCell>
                      <TableCell>
                        <Badge variant={contrato.estado === "activo" ? "default" : "secondary"}>
                          {contrato.estado === "activo" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/lecturas/${contrato.numeroContrato}/${contrato.explotacion}`)}
                          >
                            Ver Lecturas
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/contratos/detail/${contrato.numeroContrato}`)}
                          >
                            Ver Detalles
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vacío */}
      {contratos.length === 0 && !isSearching && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay contratos cargados</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Utiliza el buscador para encontrar contratos por número y ver su información detallada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
