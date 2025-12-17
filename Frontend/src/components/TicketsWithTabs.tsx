import { useTabContext } from '@/contexts/TabContext';
import { TabBar } from '@/components/TabBar';
import Tickets from '@/pages/Tickets';
import TicketDetails from '@/pages/TicketDetails';
import CreateTicket from '@/pages/CreateTicket';

export const TicketsWithTabs = () => {
  const { tabs, activeTabId } = useTabContext();

  const renderTabContent = () => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    
    if (!activeTab) return null;

    switch (activeTab.type) {
      case 'tickets-list':
        return <Tickets />;
      case 'ticket-detail':
        return <TicketDetails ticketId={activeTab.ticketId} />;
      case 'new-ticket':
        return <CreateTicket />;
      default:
        return <div className="p-6">Tab desconocido</div>;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden -m-6">
      <TabBar />
      <div className="flex-1 overflow-hidden bg-background">
        {renderTabContent()}
      </div>
    </div>
  );
};
