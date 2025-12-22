import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  userId: string;
  type: 'TICKET_CREATED' | 'TICKET_ASSIGNED' | 'TICKET_STATUS_CHANGED' | 'TICKET_PRIORITY_CHANGED' | 'TICKET_COMMENT' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  ticketId?: string;
  read: boolean;
  readAt?: string;
  metadata?: {
    ticketNumber?: string;
    priority?: string;
    status?: string;
    channel?: string;
    customerName?: string;
    createdAt?: string;
  };
  createdAt: string;
  ticket?: {
    id: string;
    folio: string;
    titulo: string;
    status: string;
    priority: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  connected: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationIdRef = useRef<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 [SSE] Fetching notifications...');
      const response = await fetch('/api/notifications', {
        credentials: 'include',
      });
      
      console.log('📥 [SSE] Response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ [SSE] Error fetching notifications:', response.status, response.statusText);
        throw new Error('Error fetching notifications');
      }
      
      const data = await response.json();
      console.log('✅ [SSE] Notifications received:', {
        count: data.notifications?.length || 0,
        unread: data.unreadCount || 0,
        data
      });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('❌ [SSE] Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error marking notification as read');
      }
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true, readAt: new Date().toISOString() } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Error al marcar notificación como leída');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error marking all as read');
      }
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Error al marcar todas como leídas');
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error deleting notification');
      }
      
      // Actualizar el estado local
      const deletedNotif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notificación eliminada');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar notificación');
    }
  }, [notifications]);

  // Función para conectar SSE
  const connectSSE = useCallback(() => {
    // Limpiar conexión anterior si existe
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    console.log('🔌 Conectando a SSE...');

    // Obtener token de la cookie
    const getAccessToken = () => {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'accessToken') {
          return value;
        }
      }
      return null;
    };

    const token = getAccessToken();
    
    if (!token) {
      console.error('❌ No se encontró token de acceso para SSE');
      setConnected(false);
      return;
    }

    // Crear nueva conexión SSE con token en query param
    const eventSource = new EventSource(`/api/notifications/stream?token=${token}`, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      console.log('✅ SSE conectado');
      setConnected(true);
      // Limpiar timeout de reconexión si existe
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('📡 SSE: Conexión confirmada');
          return;
        }

        if (data.type === 'notification') {
          const newNotification = data.data;
          
          // Evitar duplicados
          if (lastNotificationIdRef.current === newNotification.id) {
            return;
          }
          lastNotificationIdRef.current = newNotification.id;

          console.log('🔔 Nueva notificación recibida:', newNotification);

          // Agregar notificación al inicio de la lista
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Mostrar toast
          toast(newNotification.title, {
            description: newNotification.message,
            duration: 5000,
            action: newNotification.ticketId ? {
              label: 'Ver Ticket',
              onClick: () => {
                window.location.href = `/dashboard/tickets/${newNotification.ticketId}`;
              },
            } : undefined,
          });
        }
      } catch (error) {
        console.error('Error procesando mensaje SSE:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ Error en SSE:', error);
      setConnected(false);
      eventSource.close();

      // Intentar reconectar después de 5 segundos
      if (!reconnectTimeoutRef.current) {
        console.log('🔄 Reintentando conexión SSE en 5 segundos...');
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connectSSE();
        }, 5000);
      }
    };

    eventSourceRef.current = eventSource;
  }, []);

  // Fetch inicial de notificaciones
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Conectar SSE al montar el componente
  useEffect(() => {
    connectSSE();

    // Cleanup al desmontar
    return () => {
      if (eventSourceRef.current) {
        console.log('🔌 Desconectando SSE...');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connectSSE]);

  const value = {
    notifications,
    unreadCount,
    loading,
    connected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
