import { useTabContext } from '@/contexts/TabContext';
import { Button } from '@/components/ui/button';
import { X, List, Plus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TabBar = () => {
  const { tabs, activeTabId, setActiveTab, removeTab } = useTabContext();

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'tickets-list':
        return <List className="h-3.5 w-3.5" />;
      case 'new-ticket':
        return <Plus className="h-3.5 w-3.5" />;
      case 'ticket-detail':
        return <FileText className="h-3.5 w-3.5" />;
      default:
        return <FileText className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="flex items-center gap-1 border-b-2 border-border bg-muted px-3 py-2 overflow-x-auto flex-shrink-0 shadow-sm">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            'group flex items-center gap-2 rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-medium transition-all cursor-pointer',
            activeTabId === tab.id
              ? 'bg-background border-border shadow-md relative z-10 -mb-px scale-105'
              : 'bg-muted/50 border-transparent hover:bg-muted/80 hover:shadow-sm'
          )}
        >
          <button
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 min-w-0 outline-none"
          >
            {getTabIcon(tab.type)}
            <span className="truncate max-w-[150px] font-medium">{tab.title}</span>
          </button>
          {tab.id !== 'tickets-list' && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full transition-all",
                activeTabId === tab.id ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover:opacity-70 group-hover:hover:opacity-100'
              )}
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
