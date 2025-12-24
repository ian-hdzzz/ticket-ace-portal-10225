import React, { useState, useMemo } from 'react';
import { useNotifications } from '@/contexts/NotificationContextSSE';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  ExternalLink,
  Clock,
  Target,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'queue'>('all');

  // Separar notificaciones por tipo
  const assignedNotifications = useMemo(() => 
    notifications.filter(n => n.type === 'TICKET_ASSIGNED'),
    [notifications]
  );

  const queueNotifications = useMemo(() => 
    notifications.filter(n => n.type === 'TICKET_CREATED'),
    [notifications]
  );

  // Filtrar por búsqueda
  const filterBySearch = (notifs: typeof notifications) => {
    if (!searchQuery) return notifs;
    return notifs.filter((notif) =>
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredAllNotifications = filterBySearch(notifications);
  const filteredAssignedNotifications = filterBySearch(assignedNotifications);
  const filteredQueueNotifications = filterBySearch(queueNotifications);

  // Contador de no leídas por tipo
  const allUnreadCount = notifications.filter(n => !n.read).length;
  const assignedUnreadCount = assignedNotifications.filter(n => !n.read).length;
  const queueUnreadCount = queueNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TICKET_CREATED':
        return ''; // En cola
      case 'TICKET_ASSIGNED':
        return '🎯'; // Asignado a mí
      default:
        return '';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TICKET_CREATED: 'En Cola',
      TICKET_ASSIGNED: 'Asignado a Mí',
    };
    return labels[type] || type;
  };

  const getTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      TICKET_CREATED: 'Cliente esperando asesor',
      TICKET_ASSIGNED: 'Ticket asignado directamente',
    };
    return descriptions[type] || '';
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

  const renderNotificationCard = (notification: typeof notifications[0]) => (
    <Card
      key={notification.id}
      className={`p-4 transition-all hover:shadow-md relative ${
        !notification.read ? 'border-l-4 border-l-blue-600 bg-blue-50' : ''
      }`}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="text-4xl flex-shrink-0">
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
                <Badge 
                  variant={notification.type === 'TICKET_ASSIGNED' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {getTypeLabel(notification.type)}
                </Badge>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {getTypeDescription(notification.type)}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
            </div>
            {!notification.read && (
              <Badge variant="destructive" className="ml-2">
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
                <Badge 
                  className={`text-sm ${getPriorityColor(notification.metadata.priority)}`}
                  style={{ 
                    backgroundColor: notification.metadata.priority?.toLowerCase() === 'urgente' || notification.metadata.priority?.toLowerCase() === 'urgent' ? 'rgb(254, 226, 226)' :
                               notification.metadata.priority?.toLowerCase() === 'alta' || notification.metadata.priority?.toLowerCase() === 'high' ? 'rgb(255, 237, 213)' :
                               notification.metadata.priority?.toLowerCase() === 'media' || notification.metadata.priority?.toLowerCase() === 'medium' ? 'rgb(254, 249, 195)' : 'rgb(219, 234, 254)',
                    color: notification.metadata.priority?.toLowerCase() === 'urgente' || notification.metadata.priority?.toLowerCase() === 'urgent' ? 'rgb(153, 27, 27)' :
                           notification.metadata.priority?.toLowerCase() === 'alta' || notification.metadata.priority?.toLowerCase() === 'high' ? 'rgb(154, 52, 18)' :
                           notification.metadata.priority?.toLowerCase() === 'media' || notification.metadata.priority?.toLowerCase() === 'medium' ? 'rgb(133, 77, 14)' : 'rgb(30, 64, 175)',
                    pointerEvents: 'none'
                  }}
                >
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
  );

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

        {/* Search Bar */}
        <div className="relative mb-4">
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

      {/* Tabs */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando notificaciones...</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'assigned' | 'queue')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all" className="relative">
              <Inbox className="h-4 w-4 mr-2" />
              Todas ({notifications.length})
              {allUnreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {allUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="assigned" className="relative">
              <Target className="h-4 w-4 mr-2" />
              Asignados ({assignedNotifications.length})
              {assignedUnreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {assignedUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="queue" className="relative">
              <Clock className="h-4 w-4 mr-2" />
              En Cola ({queueNotifications.length})
              {queueUnreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {queueUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Todas */}
          <TabsContent value="all" className="mt-0">
            {filteredAllNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Inbox className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">No hay notificaciones</h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? 'No se encontraron notificaciones con tu búsqueda'
                    : 'Todas tus notificaciones aparecerán aquí'}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredAllNotifications.map((notification) => renderNotificationCard(notification))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Asignados */}
          <TabsContent value="assigned" className="mt-0">
            {filteredAssignedNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">No tienes tickets asignados</h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? 'No se encontraron tickets asignados con tu búsqueda'
                    : 'Los tickets que te asignen específicamente aparecerán aquí'}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredAssignedNotifications.map((notification) => (
                  renderNotificationCard(notification)
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: En Cola */}
          <TabsContent value="queue" className="mt-0">
            {filteredQueueNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">No hay tickets en cola</h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? 'No se encontraron tickets en cola con tu búsqueda'
                    : 'Los tickets que necesiten un asesor aparecerán aquí'}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredQueueNotifications.map((notification) => renderNotificationCard(notification))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Notifications;
