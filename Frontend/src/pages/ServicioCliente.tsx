import React, { useState, useEffect } from 'react';
import { useServicioCliente } from '@/contexts/ServicioClienteContext';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink, Clock, User, RefreshCw } from 'lucide-react';

export default function ServicioCliente() {
  usePageTitle('Servicio a Cliente', 'Gestión de tickets de atención al cliente');
  
  const { myTickets, queueTickets, allTickets, loading, assignTicketToMe, fetchAllData } = useServicioCliente();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgente':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'abierto':
        return 'bg-green-100 text-green-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'resuelto':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTicketCard = (ticket: any, showTomar = false, showTags = false) => {
    const customerName = ticket.customer?.nombreTitular || ticket.clientName || 'Sin nombre';
    
    return (
      <Card key={ticket.id} className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg">{ticket.folio}</h3>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
              <Badge className={getStatusColor(ticket.status)} variant="outline">
                {ticket.status}
              </Badge>
            </div>
            
            {/* Title */}
            <p className="text-gray-700 font-medium">{ticket.titulo}</p>
            
            {/* Tags (if showTags is true) */}
            {showTags && ticket.tags && ticket.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {ticket.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Customer Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{customerName}</span>
            </div>
            
            {/* Time */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(ticket.created_at || ticket.createdAt), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-2">
            {showTomar && (
              <Button
                onClick={() => assignTicketToMe(ticket.id)}
                size="sm"
                variant="default"
              >
                Tomar
              </Button>
            )}
            <Button
              onClick={() => navigate(`/dashboard/tickets/${ticket.id}`)}
              size="sm"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Ver
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const filterTickets = (tickets: any[]) => {
    if (!searchQuery) return tickets;
    return tickets.filter((ticket) => {
      const searchStr = searchQuery.toLowerCase();
      return (
        ticket.folio?.toLowerCase().includes(searchStr) ||
        ticket.titulo?.toLowerCase().includes(searchStr) ||
        ticket.customer?.nombreTitular?.toLowerCase().includes(searchStr) ||
        ticket.clientName?.toLowerCase().includes(searchStr)
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar and Refresh Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={fetchAllData}
          disabled={loading}
          variant="outline"
          size="default"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="mios" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mios">
            Mis Tickets ({myTickets.length})
          </TabsTrigger>
          <TabsTrigger value="cola">
            Cola ({queueTickets.length})
          </TabsTrigger>
          <TabsTrigger value="todos">
            Todos ({allTickets.length})
          </TabsTrigger>
        </TabsList>

        {/* Mis Tickets Tab */}
        <TabsContent value="mios" className="space-y-3 mt-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : myTickets.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No tienes tickets asignados</p>
            </Card>
          ) : (
            filterTickets(myTickets).map(ticket => renderTicketCard(ticket, false))
          )}
        </TabsContent>

        {/* Cola Tab */}
        <TabsContent value="cola" className="space-y-3 mt-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : queueTickets.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No hay tickets en cola</p>
            </Card>
          ) : (
            filterTickets(queueTickets).map(ticket => renderTicketCard(ticket, true))
          )}
        </TabsContent>

        {/* Todos Tab */}
        <TabsContent value="todos" className="space-y-3 mt-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : allTickets.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No hay tickets abiertos</p>
            </Card>
          ) : (
            filterTickets(allTickets).map(ticket => renderTicketCard(ticket, false, true))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

