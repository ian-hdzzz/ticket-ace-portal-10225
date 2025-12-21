import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

const Notifications: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead 
  } = useNotifications();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || notif.type === filterType;
    
    const matchesRead = 
      filterRead === 'all' || 
      (filterRead === 'unread' && !notif.read) ||
      (filterRead === 'read' && notif.read);

    return matchesSearch && matchesType && matchesRead;
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.ticketId) {
      navigate(`/dashboard/tickets/${notification.ticketId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TICKET_CREATED':
        return '';
      case 'TICKET_ASSIGNED':
        return '👤';
      case 'TICKET_STATUS_CHANGED':
        return '🔄';
      case 'TICKET_PRIORITY_CHANGED':
        return '⚡';
      case 'TICKET_COMMENT':
        return '💬';
      case 'SYSTEM_ALERT':
        return '🔔';
      default:
        return '📋';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TICKET_CREATED: 'Ticket Creado',
      TICKET_ASSIGNED: 'Ticket Asignado',
      TICKET_STATUS_CHANGED: 'Estado Cambiado',
      TICKET_PRIORITY_CHANGED: 'Prioridad Cambiada',
      TICKET_COMMENT: 'Nuevo Comentario',
      SYSTEM_ALERT: 'Alerta del Sistema',
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgente':
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'alta':
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'media':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Notificaciones</h1>
              <p className="text-gray-600">
                {unreadCount > 0 
                  ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
                  : 'No tienes notificaciones sin leer'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button onClick={() => markAllAsRead()} variant="outline">
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar notificaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="TICKET_CREATED">Tickets Creados</SelectItem>
                <SelectItem value="TICKET_ASSIGNED">Asignaciones</SelectItem>
                <SelectItem value="TICKET_STATUS_CHANGED">Cambios de Estado</SelectItem>
                <SelectItem value="TICKET_PRIORITY_CHANGED">Cambios de Prioridad</SelectItem>
                <SelectItem value="TICKET_COMMENT">Comentarios</SelectItem>
                <SelectItem value="SYSTEM_ALERT">Alertas</SelectItem>
              </SelectContent>
            </Select>

            {/* Read/Unread Filter */}
            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Sin leer</SelectItem>
                <SelectItem value="read">Leídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando notificaciones...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold mb-2">No hay notificaciones</h3>
          <p className="text-gray-600">
            {searchQuery || filterType !== 'all' || filterRead !== 'all'
              ? 'No se encontraron notificaciones con los filtros aplicados'
              : 'Cuando recibas notificaciones, aparecerán aquí'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md relative ${
                !notification.read ? 'border-l-4 border-l-blue-600 bg-blue-50' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title and Time */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(notification.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                    {!notification.read && (
                      <Badge variant="default" className="ml-2">
                        Nuevo
                      </Badge>
                    )}
                  </div>

                  {/* Message */}
                  <p className="text-gray-700 mb-3">{notification.message}</p>

                  {/* Metadata */}
                  {notification.metadata && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {notification.metadata.ticketNumber && (
                        <Badge variant="outline" className="text-sm">
                          Ticket #{notification.metadata.ticketNumber}
                        </Badge>
                      )}
                      {notification.metadata.priority && (
                        <Badge className={`text-sm ${getPriorityColor(notification.metadata.priority)}`}>
                          Prioridad: {notification.metadata.priority}
                        </Badge>
                      )}
                      {notification.metadata.status && (
                        <Badge variant="outline" className="text-sm">
                          Estado: {notification.metadata.status}
                        </Badge>
                      )}
                      {notification.metadata.customerName && (
                        <Badge variant="outline" className="text-sm">
                          Cliente: {notification.metadata.customerName}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {notification.ticketId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/tickets/${notification.ticketId}`);
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver Ticket
                      </Button>
                    )}
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Marcar como leída
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
