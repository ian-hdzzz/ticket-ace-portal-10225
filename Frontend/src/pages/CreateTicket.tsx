import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useTabContext } from '@/contexts/TabContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { createTicket } from '@/api/ticketsSupabase';
import { CreateTicketData, ServiceType, TicketTypeCode, PriorityLevel, ChannelType } from '@/types/entities';

const serviceTypeOptions: { value: ServiceType; label: string }[] = [
  { value: 'aclaraciones', label: 'Aclaraciones' },
  { value: 'actualizar_caso', label: 'Actualizar Caso' },
  { value: 'asesor_humano', label: 'Asesor Humano' },
  { value: 'contratacion_cambio', label: 'Contratación/Cambio' },
  { value: 'pago_recibo', label: 'Pago de Recibo' },
  { value: 'recibo_digital', label: 'Recibo Digital' },
  { value: 'reportar_lectura', label: 'Reportar Lectura' },
  { value: 'reportes_fugas', label: 'Reportes de Fugas' },
  { value: 'revision_recibo', label: 'Revisión de Recibo' },
];

const ticketTypeOptions: { value: TicketTypeCode; label: string }[] = [
  { value: 'FUG', label: 'Reportes de Fugas' },
  { value: 'ACL', label: 'Aclaraciones' },
  { value: 'CON', label: 'Contratación' },
  { value: 'PAG', label: 'Pago' },
  { value: 'LEC', label: 'Lectura' },
  { value: 'REV', label: 'Revisión' },
  { value: 'DIG', label: 'Digital' },
  { value: 'ACT', label: 'Actualizar Caso' },
  { value: 'URG', label: 'Urgente' },
];

const priorityOptions: { value: PriorityLevel; label: string }[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

const channelOptions: { value: ChannelType; label: string }[] = [
  { value: 'telefono', label: 'Teléfono' },
  { value: 'email', label: 'Email' },
  { value: 'app_movil', label: 'App Móvil' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'web_chat', label: 'Chat Web' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export default function CreateTicket() {
  // Establecer título de la página
  usePageTitle("Crear Ticket", "Registra un nuevo ticket en el sistema");
  
  const navigate = useNavigate();
  const { removeTab, setActiveTab } = useTabContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  const [formData, setFormData] = useState<CreateTicketData>({
    titulo: '',
    descripcion: '',
    customer_id: '',
    service_type: 'reportes_fugas',
    ticket_type: 'FUG',
    priority: 'media',
    channel: 'telefono',
    tags: [],
    metadata: {},
  });

  const handleInputChange = (field: keyof CreateTicketData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (!formData.service_type) {
      toast.error('El tipo de servicio es obligatorio');
      return;
    }

    if (!formData.ticket_type) {
      toast.error('El tipo de ticket es obligatorio');
      return;
    }

    if (!formData.channel) {
      toast.error('El canal es obligatorio');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(' Enviando datos del ticket:', formData);
      const newTicket = await createTicket(formData);
      console.log(' Ticket creado exitosamente:', newTicket);
      
      toast.success('Ticket creado exitosamente', {
        description: `Folio: ${newTicket.folio}`
      });
      removeTab('new-ticket');
      setActiveTab('tickets-list');
    } catch (error) {
      console.error('Error creando ticket:', error);
      toast.error('Error al crear el ticket', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full overflow-auto">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                removeTab('new-ticket');
                setActiveTab('tickets-list');
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Regresar
            </Button>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Ticket</CardTitle>
            <CardDescription>
              Complete los campos necesarios para crear un nuevo ticket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  placeholder="Ingrese el título del ticket"
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder="Descripción detallada del problema o solicitud"
                  rows={4}
                />
              </div>

              {/* Customer ID */}
              <div className="space-y-2">
                <Label htmlFor="customer_id">ID del Cliente (opcional)</Label>
                <Input
                  id="customer_id"
                  value={formData.customer_id}
                  onChange={(e) => handleInputChange('customer_id', e.target.value)}
                  placeholder="UUID del cliente (ej: 123e4567-e89b-12d3-a456-426614174000) - opcional"
                />
                <p className="text-xs text-muted-foreground">
                  Debe ser un UUID válido. Déjalo vacío si no tienes el ID del cliente.
                </p>
              </div>

              {/* Tipo de Servicio y Tipo de Ticket */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Servicio *</Label>
                  <Select
                    value={formData.service_type}
                    onValueChange={(value: ServiceType) => handleInputChange('service_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Ticket *</Label>
                  <Select
                    value={formData.ticket_type}
                    onValueChange={(value: TicketTypeCode) => handleInputChange('ticket_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Prioridad y Canal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: PriorityLevel) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Canal *</Label>
                  <Select
                    value={formData.channel}
                    onValueChange={(value: ChannelType) => handleInputChange('channel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {channelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Etiquetas</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Agregar etiqueta"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    removeTab('new-ticket');
                    setActiveTab('tickets-list');
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Creando...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Crear Ticket
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
