import React, { useState, ReactNode } from 'react';

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

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className={className}>
      <div className={`flex ${variant === 'chrome' ? 'border-b border-neutral-200 bg-neutral-100 rounded-t-lg' : 'border-b border-neutral-200'}`}>
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
            >
              {tab.label}
            </div>
          );
        })}
      </div>
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