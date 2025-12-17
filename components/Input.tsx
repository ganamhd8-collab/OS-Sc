import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  subLabel?: string;
}

export const Input: React.FC<InputProps> = ({ label, subLabel, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        {label && <label className="text-sm font-semibold text-navy/80">{label}</label>}
        {subLabel && <span className="text-xs text-navy/40 font-mono">{subLabel}</span>}
      </div>
      <input 
        className={`flex h-12 w-full rounded-xl border-none bg-input px-4 py-2 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-purple/50 font-medium font-mono text-sm transition-all ${className}`}
        {...props}
      />
    </div>
  );
};