import React, { useState, useMemo } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Search, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContextSSE';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const NotificationWidget: React.FC = () => {
  const { notifications, unreadCount, markAsRead, deleteNotification, markAllAsRead, connected, loading } = useNotifications();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'past'>('today');
  const navigate = useNavigate();

  const filteredNotifications = searchQuery
    ? notifications.filter((notif) =>
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notifications;

  // Separate notifications into today and past
  const { todayNotifications, pastNotifications } = useMemo(() => {
    const today: any[] = [];
    const past: any[] = [];
    
    filteredNotifications.forEach((notif) => {
      const notifDate = parseISO(notif.createdAt);
      if (isToday(notifDate)) {
        today.push(notif);
      } else {
        past.push(notif);
      }
    });
    
    return { todayNotifications: today, pastNotifications: past };
  }, [filteredNotifications]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.ticketId) {
      setOpen(false);
      navigate(`/dashboard/tickets/${notification.ticketId}`);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const handleViewTicket = (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation();
    setOpen(false);
    navigate(`/dashboard/tickets/${ticketId}`);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TICKET_CREATED':
        return '';
      case 'TICKET_ASSIGNED':
        return '';
      case 'TICKET_STATUS_CHANGED':
        return '🔄';
      case 'TICKET_PRIORITY_CHANGED':
        return '⚡';
      case 'TICKET_COMMENT':
        return '💬';
      case 'SYSTEM_ALERT':
        return '🔔';
      default:
        return '';
    }
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

  const renderNotificationCard = (notification: any) => (
    <div
      key={notification.id}
      className={`p-4 border-b hover:bg-gray-50 transition-colors relative ${
        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
      }`}
    >
      {/* Indicador de no leído */}
      {!notification.read && (
        <div className="absolute left-2 top-6 w-2 h-2 bg-blue-600 rounded-full" />
      )}

      <div className="flex gap-3 pl-4">
        {/* Icono */}
        <div className="text-3xl flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-base text-gray-900">
              {notification.title}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-3">
            {notification.message}
          </p>
          
          {/* Metadata */}
          {notification.metadata && (
            <div className="flex flex-wrap gap-2 mb-3">
              {notification.metadata.ticketNumber && (
                <Badge variant="outline" className="text-xs">
                  Ticket #{notification.metadata.ticketNumber}
                </Badge>
              )}
              {notification.metadata.priority && (
                <Badge 
                  className={`text-xs ${getPriorityColor(notification.metadata.priority)}`}
                >
                  {notification.metadata.priority}
                </Badge>
              )}
              {notification.metadata.status && (
                <Badge variant="outline" className="text-xs">
                  {notification.metadata.status}
                </Badge>
              )}
              {notification.metadata.customerName && (
                <Badge variant="outline" className="text-xs">
                  {notification.metadata.customerName}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {notification.ticketId && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => handleViewTicket(e, notification.ticketId)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver Ticket
              </Button>
            )}
            {!notification.read && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleMarkAsRead(e, notification.id)}
              >
                <Check className="h-3 w-3 mr-1" />
                Marcar como leída
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => handleDelete(e, notification.id)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 relative"
        variant="default"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen} modal={false}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col overflow-hidden" hideOverlay>
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-primary" />
                <div>
                  <SheetTitle className="text-2xl">Notificaciones</SheetTitle>
                  <SheetDescription>
                    {unreadCount > 0 
                      ? `${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
                      : 'No tienes notificaciones sin leer'}
                  </SheetDescription>
                </div>
              </div>
              {/* SSE Connection Status */}
              {connected ? (
                <div className="bg-green-50 rounded-full px-3 py-2 border border-green-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-700">Tiempo real</span>
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-full px-3 py-2 border border-yellow-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-xs text-yellow-700">Desconectado</span>
                </div>
              )}
            </div>
          </SheetHeader>

          {/* Search and Actions */}
          <div className="px-6 py-4 border-b space-y-3">
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
            {unreadCount > 0 && (
              <Button 
                onClick={() => markAllAsRead()} 
                variant="outline"
                size="sm"
                className="w-full"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'today' | 'past')} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full rounded-none border-b flex-shrink-0">
              <TabsTrigger value="today" className="flex-1">
                Hoy
                {todayNotifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {todayNotifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1">
                Anteriores
                {pastNotifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pastNotifications.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Today Tab Content */}
            <TabsContent value="today" className="flex-1 m-0 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando notificaciones...</p>
                  </div>
                ) : todayNotifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? 'No se encontraron notificaciones de hoy' : 'No tienes notificaciones de hoy'}
                    </h3>
                    <p className="text-sm">
                      {searchQuery 
                        ? 'Intenta con otros términos de búsqueda'
                        : 'Las notificaciones de hoy aparecerán aquí'}
                    </p>
                  </div>
                ) : (
                  <div>
                    {todayNotifications.map((notification) => renderNotificationCard(notification))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Past Tab Content */}
            <TabsContent value="past" className="flex-1 m-0 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando notificaciones...</p>
                  </div>
                ) : pastNotifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? 'No se encontraron notificaciones anteriores' : 'No tienes notificaciones anteriores'}
                    </h3>
                    <p className="text-sm">
                      {searchQuery 
                        ? 'Intenta con otros términos de búsqueda'
                        : 'Las notificaciones anteriores aparecerán aquí'}
                    </p>
                  </div>
                ) : (
                  <div>
                    {pastNotifications.map((notification) => renderNotificationCard(notification))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
};
