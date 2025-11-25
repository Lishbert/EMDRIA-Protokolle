import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => (
    <div className="flex-1 min-w-[100px]">
        {label && <label className="block text-sm font-medium text-on-surface mb-1">{label}</label>}
        <input
            className={`w-full bg-background border ${error ? 'border-red-500' : 'border-muted'} rounded-md px-3 py-2 text-on-surface-strong focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none ${className || ''}`}
            {...props}
        />
    </div>
);

