'use client';

import { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-400">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
