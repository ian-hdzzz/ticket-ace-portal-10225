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
  reconnect: () => void;
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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  // 🔥 TEMPORARY: Enable polling for demo (set to true to use polling instead of SSE)
  const USE_POLLING = true;
  const POLLING_INTERVAL = 15000; // 15 seconds

  // Load previously shown notification IDs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('shownNotifications');
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        shownNotificationsRef.current = new Set(ids);
        console.log('📋 [NOTIFICATIONS] Loaded shown notifications:', ids.length);
      } catch (e) {
        console.error('Failed to parse shown notifications', e);
      }
    }
  }, []);

  const fetchNotifications = useCallback(async (isPolling = false) => {
    try {
      // Prevent rapid successive calls - enforce minimum time between fetches
      const now = Date.now();
      if (isPolling && (now - lastFetchTimeRef.current) < POLLING_INTERVAL - 1000) {
        console.log('⏭️ [POLLING] Skipping fetch - too soon since last fetch');
        return;
      }
      lastFetchTimeRef.current = now;

      if (!isPolling) {
        setLoading(true);
      }
      
      // Get userId from localStorage
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : null;
      const url = userId ? `/api/notifications?userId=${userId}` : '/api/notifications';
      
      console.log(`🔄 [${USE_POLLING ? 'POLLING' : 'SSE'}] Fetching notifications at ${new Date().toLocaleTimeString()}...`);
      console.log(`🔑 [FETCH] URL with userId:`, url);
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      console.log(`📥 [${USE_POLLING ? 'POLLING' : 'SSE'}] Response status:`, response.status);
      
      if (!response.ok) {
        console.error(`❌ [${USE_POLLING ? 'POLLING' : 'SSE'}] Error fetching notifications:`, response.status, response.statusText);
        throw new Error('Error fetching notifications');
      }
      
      const data = await response.json();
      const newNotificationsList = data.notifications || [];
      const newUnreadCount = data.unreadCount || 0;

      console.log(`✅ [${USE_POLLING ? 'POLLING' : 'SSE'}] Notifications received:`, {
        count: newNotificationsList.length,
        unread: newUnreadCount,
        isPolling,
      });

      // When polling, check for new notifications and show toast
      if (isPolling && USE_POLLING) {
        const currentIds = new Set(notifications.map(n => n.id));
        const newNotifications = newNotificationsList.filter((n: Notification) => {
          // Check if not in current list AND not already shown before
          return !currentIds.has(n.id) && !shownNotificationsRef.current.has(n.id);
        });
        
        if (newNotifications.length > 0) {
          console.log('🆕 [POLLING] New notifications detected:', newNotifications.length);
          
          // Mark as shown and persist to localStorage
          newNotifications.forEach((notif: Notification) => {
            shownNotificationsRef.current.add(notif.id);
            
            toast(notif.title, {
              description: notif.message,
              duration: 5000,
              action: notif.ticketId ? {
                label: 'Ver Ticket',
                onClick: () => {
                  window.location.href = `/dashboard/tickets/${notif.ticketId}`;
                },
              } : undefined,
            });
          });

          // Persist to localStorage
          localStorage.setItem(
            'shownNotifications', 
            JSON.stringify(Array.from(shownNotificationsRef.current))
          );
          console.log('💾 [NOTIFICATIONS] Saved shown notifications to localStorage');
        }
      }

      // Only update state if data actually changed
      setNotifications(prev => {
        const prevIds = prev.map(n => n.id).sort().join(',');
        const newIds = newNotificationsList.map((n: Notification) => n.id).sort().join(',');
        if (prevIds === newIds) {
          console.log('📌 [STATE] Notifications unchanged, skipping update');
          return prev;
        }
        console.log('🔄 [STATE] Updating notifications');
        return newNotificationsList;
      });

      setUnreadCount(prev => {
        if (prev === newUnreadCount) {
          console.log('📌 [STATE] Unread count unchanged, skipping update');
          return prev;
        }
        console.log('🔄 [STATE] Updating unread count');
        return newUnreadCount;
      });
    } catch (error) {
      console.error(`❌ [${USE_POLLING ? 'POLLING' : 'SSE'}] Error fetching notifications:`, error);
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  }, [USE_POLLING, POLLING_INTERVAL, notifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      // Get userId from localStorage
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : null;
      const url = userId ? `/api/notifications/${id}/read?userId=${userId}` : `/api/notifications/${id}/read`;
      
      const response = await fetch(url, {
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
      // Get userId from localStorage
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : null;
      const url = userId ? `/api/notifications/read-all?userId=${userId}` : '/api/notifications/read-all';
      
      const response = await fetch(url, {
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
      // Get userId from localStorage
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : null;
      const url = userId ? `/api/notifications/${id}?userId=${userId}` : `/api/notifications/${id}`;
      
      const response = await fetch(url, {
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

      // Also remove from shown notifications to free up storage
      if (shownNotificationsRef.current.has(id)) {
        shownNotificationsRef.current.delete(id);
        localStorage.setItem(
          'shownNotifications', 
          JSON.stringify(Array.from(shownNotificationsRef.current))
        );
      }

      toast.success('Notificación eliminada');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar notificación');
    }
  }, [notifications]);

  // Función para conectar SSE
  const connectSSE = useCallback(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d4c6058-b7eb-4349-b632-86ddda782c0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationContextSSE.tsx:164',message:'connectSSE called',data:{hasExistingConnection:!!eventSourceRef.current},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    // Limpiar conexión anterior si existe
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    console.log('🔌 Conectando a SSE...');

    // Obtener token de la cookie
    const getAccessToken = () => {
      // #region agent log
      const allCookies = document.cookie;
      fetch('http://127.0.0.1:7242/ingest/1d4c6058-b7eb-4349-b632-86ddda782c0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationContextSSE.tsx:173',message:'Parsing cookies',data:{allCookies:allCookies,cookieLength:allCookies.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,C'})}).catch(()=>{});
      // #endregion
      
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1d4c6058-b7eb-4349-b632-86ddda782c0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationContextSSE.tsx:179',message:'Cookie parsed',data:{name:name,hasValue:!!value,valueLength:value?.length||0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        if (name === 'accessToken') {
          return value;
        }
      }
      return null;
    };

    const token = getAccessToken();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d4c6058-b7eb-4349-b632-86ddda782c0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationContextSSE.tsx:191',message:'Token retrieved',data:{hasToken:!!token,tokenLength:token?.length||0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C'})}).catch(()=>{});
    // #endregion
    
    if (!token) {
      console.warn('⚠️  No se encontró token de acceso para SSE, reintentando en 1 segundo...');
      setConnected(false);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1d4c6058-b7eb-4349-b632-86ddda782c0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationContextSSE.tsx:198',message:'Starting retry timeout',data:{retryDelayMs:1000},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Retry after 1 second to allow token refresh to complete
      setTimeout(() => {
        // #region agent log
        const allCookiesRetry = document.cookie;
        fetch('http://127.0.0.1:7242/ingest/1d4c6058-b7eb-4349-b632-86ddda782c0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationContextSSE.tsx:204',message:'Retry timeout fired',data:{allCookies:allCookiesRetry},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const retryToken = getAccessToken();
        if (retryToken) {
          console.log('✅ Token encontrado en reintento, conectando SSE...');
          connectSSE();
        } else {
          console.error('❌ Token aún no disponible después de reintento');
        }
      }, 1000);
      return;
    }

    // Crear nueva conexión SSE con token en query param
    console.log('🔗 Creando EventSource con token...');
    const eventSource = new EventSource(`/api/notifications/stream?token=${token}`, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      console.log('✅ SSE conectado exitosamente');
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d4c6058-b7eb-4349-b632-86ddda782c0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationContextSSE.tsx:267',message:'fetchNotifications useEffect triggered',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // Check if user is logged in before fetching
    const userStr = localStorage.getItem('user');
    if (userStr) {
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  // 🔥 TEMPORARY: Polling setup for demo
  useEffect(() => {
    if (!USE_POLLING) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    console.log(`🔄 [POLLING] Starting polling every ${POLLING_INTERVAL / 1000} seconds`);
    setConnected(true); // Show as "connected" when polling is active

    // Clear any existing interval first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Start polling
    pollingIntervalRef.current = setInterval(() => {
      console.log(`⏰ [POLLING] Interval triggered at ${new Date().toLocaleTimeString()}`);
      fetchNotifications(true);
    }, POLLING_INTERVAL);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        console.log('⏹️ [POLLING] Stopping polling');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [USE_POLLING, POLLING_INTERVAL]);

  // Conectar SSE al montar el componente (only if not using polling)
  useEffect(() => {
    if (USE_POLLING) {
      console.log('⏭️ Skipping SSE setup - Using polling mode');
      return;
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d4c6058-b7eb-4349-b632-86ddda782c0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NotificationContextSSE.tsx:279',message:'connectSSE useEffect triggered',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // Check if user is logged in before connecting SSE
    const userStr = localStorage.getItem('user');
    if (userStr) {
      connectSSE();
    }

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
  }, [connectSSE, USE_POLLING]);

  const reconnect = useCallback(() => {
    console.log(`🔄 Reconnecting notifications (${USE_POLLING ? 'POLLING' : 'SSE'})...`);
    fetchNotifications(false);
    if (!USE_POLLING) {
      connectSSE();
    }
  }, [fetchNotifications, connectSSE, USE_POLLING]);

  const value = {
    notifications,
    unreadCount,
    loading,
    connected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reconnect,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
