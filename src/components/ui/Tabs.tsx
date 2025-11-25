import React from 'react';

export interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="border-b border-muted/30">
            <div className="flex gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all duration-200 border-b-2 ${
                            activeTab === tab.id
                                ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                                : 'border-transparent text-muted hover:text-on-surface hover:bg-surface/50'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

