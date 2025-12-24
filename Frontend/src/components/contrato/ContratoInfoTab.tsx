import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, MapPin, Phone, Mail, Calendar, Hash, FileText } from "lucide-react";

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

interface ContratoInfoTabProps {
  contrato: ContratoData;
}

export default function ContratoInfoTab({ contrato }: ContratoInfoTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Información del Titular */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Titular del Contrato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nombre Completo</p>
            <p className="font-medium text-lg">{contrato.titular}</p>
          </div>

          <Separator />

          {contrato.telefono && (
            <>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Teléfono
                </p>
                <p className="font-medium">{contrato.telefono}</p>
              </div>
              <Separator />
            </>
          )}

          {contrato.email && (
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Correo Electrónico
              </p>
              <p className="font-medium">{contrato.email}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del Contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Datos del Contrato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">N° Contrato</p>
              <p className="font-medium font-mono">{contrato.numeroContrato}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Explotación</p>
              <Badge variant="secondary" className="font-mono">
                {contrato.explotacion}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Tipo de Uso</p>
            <p className="font-medium">{contrato.descUso}</p>
            <p className="text-xs text-muted-foreground">Código: {contrato.tipoUso}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Estado</p>
            <Badge variant={contrato.estado === "activo" ? "default" : "secondary"}>
              {contrato.estado === "activo" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Información del Punto de Suministro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Punto de Suministro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Dirección</p>
            <p className="font-medium">{contrato.direccion}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Número de Contador
            </p>
            <p className="font-medium font-mono">{contrato.numeroContador}</p>
          </div>
        </CardContent>
      </Card>

      {/* Fechas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fechas del Contrato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Alta</p>
            <p className="font-medium">{contrato.fechaAlta}</p>
          </div>

          {contrato.fechaBaja && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Baja</p>
                <p className="font-medium text-destructive">{contrato.fechaBaja}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
