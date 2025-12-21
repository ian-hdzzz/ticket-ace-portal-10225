import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContextSSE';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const NotificationWidget: React.FC = () => {
  const { notifications, unreadCount, markAsRead, deleteNotification, markAllAsRead, connected } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const recentNotifications = notifications.slice(0, 5);

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
        return '';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgente':
      case 'urgent':
        return 'text-red-600';
      case 'alta':
      case 'high':
        return 'text-orange-600';
      case 'media':
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 relative"
            variant="default"

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
        </PopoverTrigger>
        <PopoverContent 
          className="w-96 p-0 mr-4 mb-2" 
          align="end"
          side="top"
        >
          <div className="bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Notificaciones</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} nuevas</Badge>
                )}
              </div>
              {/* Indicador de conexión SSE */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} 
                     title={connected ? 'SSE Conectado - Tiempo Real' : 'SSE Desconectado'} />
                <span className="text-xs text-gray-500">
                  {connected ? 'Live' : ''}
                </span>
              </div>
            </div>

            {/* Notifications List */}
            <ScrollArea className="max-h-[400px]">
              {recentNotifications.length === 0 ? (
                <div 
                  className="p-8 text-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setOpen(false);
                    navigate('/dashboard/notifications');
                  }}
                >
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No tienes notificaciones</p>
                  <p className="text-xs text-gray-400 mt-2">Click para ver más detalles</p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative group ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Indicador de no leído */}
                      {!notification.read && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                      )}

                      <div className="flex gap-3 pl-4">
                        {/* Icono */}
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          
                          {/* Metadata */}
                          {notification.metadata && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {notification.metadata.ticketNumber && (
                                <Badge variant="outline" className="text-xs">
                                  #{notification.metadata.ticketNumber}
                                </Badge>
                              )}
                              {notification.metadata.priority && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(notification.metadata.priority)}`}
                                >
                                  {notification.metadata.priority}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => handleMarkAsRead(e, notification.id)}
                              title="Marcar como leída"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            onClick={(e) => handleDelete(e, notification.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => {
                    setOpen(false);
                    navigate('/dashboard/notifications');
                  }}
                >
                  Ver todas las notificaciones →
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
