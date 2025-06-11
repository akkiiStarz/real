import React, { useState, ReactNode, useRef } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'chrome' | 'underline';
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, variant = 'chrome', className = '' }) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0].id);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const tabContainerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>, tab: Tab) => {
    if (tab.disabled) {
      const rect = (event.target as HTMLDivElement).getBoundingClientRect();
      const containerRect = tabContainerRef.current?.getBoundingClientRect();
      if (containerRect) {
        setTooltipPosition({
          left: rect.left - containerRect.left + rect.width / 2,
          top: rect.bottom - containerRect.top + 8,
        });
        setTooltipVisible(true);
      }
    }
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <div className={className}>
      <div
        className={`flex ${variant === 'chrome' ? 'border-b border-neutral-200 bg-neutral-100 rounded-t-lg' : 'border-b border-neutral-200'}`}
        ref={tabContainerRef}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          let tabClassName = '';
          
          if (variant === 'chrome') {
            tabClassName = `py-3 px-6 font-medium ${
              isActive 
                ? 'bg-white text-primary border-t-2 border-l border-r rounded-t-lg border-t-accent border-neutral-200 relative -mb-px' 
                : 'text-neutral-600 hover:text-primary'
            } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
          } else {
            tabClassName = `py-3 px-6 font-medium ${
              isActive 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-neutral-600 hover:text-primary'
            } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
          }
          
          return (
            <div
              key={tab.id}
              className={tabClassName}
              onClick={() => !tab.disabled && handleTabClick(tab.id)}
              onMouseEnter={(e) => handleMouseEnter(e, tab)}
              onMouseLeave={handleMouseLeave}
            >
              {tab.label}
            </div>
          );
        })}
      </div>
      {tooltipVisible && (
        <div
          className="absolute bg-black text-white text-xs rounded px-2 py-1 pointer-events-none select-none"
          style={{ position: 'absolute', left: tooltipPosition.left, top: tooltipPosition.top, transform: 'translateX(-50%)', whiteSpace: 'nowrap', zIndex: 1000 }}
        >
          Coming Soon
        </div>
      )}
      <div className="py-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
