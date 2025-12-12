import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Tab {
  id: string;
  type: 'tickets-list' | 'ticket-detail' | 'new-ticket';
  title: string;
  ticketId?: string;
  data?: any;
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'tickets-list', type: 'tickets-list', title: 'Lista de Tickets' }
  ]);
  const [activeTabId, setActiveTabId] = useState('tickets-list');

  const addTab = (tab: Tab) => {
    setTabs((prevTabs) => {
      // Verificar si ya existe un tab con el mismo ID
      const existingTab = prevTabs.find((t) => t.id === tab.id);
      if (existingTab) {
        setActiveTabId(tab.id);
        return prevTabs;
      }
      return [...prevTabs, tab];
    });
    setActiveTabId(tab.id);
  };

  const removeTab = (tabId: string) => {
    setTabs((prevTabs) => {
      const filtered = prevTabs.filter((t) => t.id !== tabId);
      // Si se cierra el tab activo, activar el anterior o el primero
      if (activeTabId === tabId && filtered.length > 0) {
        const currentIndex = prevTabs.findIndex((t) => t.id === tabId);
        const newActiveIndex = Math.max(0, currentIndex - 1);
        setActiveTabId(filtered[newActiveIndex].id);
      }
      return filtered;
    });
  };

  const setActiveTab = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab))
    );
  };

  return (
    <TabContext.Provider
      value={{ tabs, activeTabId, addTab, removeTab, setActiveTab, updateTab }}
    >
      {children}
    </TabContext.Provider>
  );
};

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabContext must be used within a TabProvider');
  }
  return context;
};
