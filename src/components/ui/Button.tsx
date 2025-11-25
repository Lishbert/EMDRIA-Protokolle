import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
    const baseClasses = "flex flex-row items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-lg hover:shadow-xl border-2 hover:scale-[1.02]";
    const variantClasses = {
        primary: "bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-white border-blue-200 hover:border-blue-100 hover:brightness-110",
        secondary: "bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-900 border-yellow-200 hover:border-yellow-100 hover:brightness-110",
        danger: "bg-gradient-to-br from-red-400 to-rose-600 hover:from-red-300 hover:to-rose-500 text-white border-red-200 hover:border-red-100 hover:brightness-110",
        success: "bg-gradient-to-br from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-white border-green-200 hover:border-green-100 hover:brightness-110",
    };
    
    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${props.className || ''}`} {...props}>
            {children}
        </button>
    );
};

