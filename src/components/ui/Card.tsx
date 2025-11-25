import React from 'react';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    headerRight?: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, headerRight, className }) => (
    <div className={`bg-surface rounded-lg shadow-md p-6 flex flex-col ${className || ''}`}>
        {title && (
            <div className="flex justify-between items-start mb-4 shrink-0">
                <h2 className="text-2xl font-bold text-on-surface-strong">{title}</h2>
                {headerRight}
            </div>
        )}
        <div className="flex-grow flex flex-col">
            {children}
        </div>
    </div>
);

