import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';
import apiClient from '../api/client';

interface Ticket {
  id: string;
  folio: string;
  titulo: string;
  descripcion?: string;
  status: string;
  priority: string;
  created_at: string;
  assigned_to: string | null;
  tags: string[];
  customer?: {
    id: string;
    nombreTitular?: string;
    email?: string;
    telefono?: string;
  };
}

interface ServicioClienteContextType {
  myTickets: Ticket[];
  queueTickets: Ticket[];
  allTickets: Ticket[];
  loading: boolean;
  fetchMyTickets: () => Promise<void>;
  fetchQueueTickets: () => Promise<void>;
  fetchAllTickets: () => Promise<void>;
  fetchAllData: () => Promise<void>;
  assignTicketToMe: (ticketId: string) => Promise<void>;
}

const ServicioClienteContext = createContext<ServicioClienteContextType | undefined>(undefined);

export const useServicioCliente = () => {
  const context = useContext(ServicioClienteContext);
  if (!context) {
    throw new Error('useServicioCliente must be used within ServicioClienteProvider');
  }
  return context;
};

export const ServicioClienteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [queueTickets, setQueueTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyTickets = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/servicio-cliente/my-tickets');
      if (response.data.success) {
        setMyTickets(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching my tickets:', error);
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        toast.error('Error al cargar mis tickets');
      }
    }
  }, []);

  const fetchQueueTickets = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/servicio-cliente/queue');
      if (response.data.success) {
        setQueueTickets(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching queue tickets:', error);
      if (error.response?.status !== 401) {
        toast.error('Error al cargar cola de tickets');
      }
    }
  }, []);

  const fetchAllTickets = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/servicio-cliente/all-tickets');
      if (response.data.success) {
        setAllTickets(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching all tickets:', error);
      if (error.response?.status !== 401) {
        toast.error('Error al cargar todos los tickets');
      }
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Call endpoints sequentially to avoid overwhelming the server
      await fetchMyTickets();
      await fetchQueueTickets();
      await fetchAllTickets();
    } finally {
      setLoading(false);
    }
  }, [fetchMyTickets, fetchQueueTickets, fetchAllTickets]);

  const assignTicketToMe = useCallback(async (ticketId: string) => {
    try {
      const response = await apiClient.post(`/servicio-cliente/${ticketId}/assign`);
      
      if (response.data.success) {
        toast.success('Ticket asignado exitosamente');
        // Refetch all data to update the tabs
        await fetchAllData();
      }
    } catch (error: any) {
      console.error('Error assigning ticket:', error);
      toast.error(error.response?.data?.error || 'Error al asignar ticket');
    }
  }, [fetchAllData]);

  const value = {
    myTickets,
    queueTickets,
    allTickets,
    loading,
    fetchMyTickets,
    fetchQueueTickets,
    fetchAllTickets,
    fetchAllData,
    assignTicketToMe,
  };

  return (
    <ServicioClienteContext.Provider value={value}>
      {children}
    </ServicioClienteContext.Provider>
  );
};
