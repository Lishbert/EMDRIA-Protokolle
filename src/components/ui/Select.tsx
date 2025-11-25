import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, children, className, ...props }) => (
    <div className="flex-1 min-w-[100px]">
        {label && <label className="block text-sm font-medium text-on-surface mb-1">{label}</label>}
        <select
            className={`w-full bg-background border border-muted rounded-md px-3 py-2 text-on-surface-strong focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none ${className || ''}`}
            {...props}
        >
            {children}
        </select>
    </div>
);

