import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95";
  
  const variants = {
    primary: "bg-purple text-white shadow-lg shadow-purple/30 hover:bg-[#837AD6] rounded-full",
    secondary: "bg-softBlue text-navy shadow-lg shadow-softBlue/30 hover:bg-[#9BC5F8] rounded-full",
    danger: "bg-red-400 text-white hover:bg-red-500 rounded-full",
    ghost: "bg-transparent text-slate-500 hover:text-navy hover:bg-input rounded-full",
    icon: "bg-purple text-white hover:bg-[#837AD6] rounded-full shadow-lg"
  };

  const sizes = {
    sm: "h-8 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base",
    icon: "h-12 w-12 p-0"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
      {children}
    </button>
  );
};