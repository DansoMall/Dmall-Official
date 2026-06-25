'use client';

import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const sizeMap = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-[52px] px-8 text-[17px]',
};

export default function PrimaryButton({ label, loading, size = 'lg', fullWidth, className = '', ...props }: Props) {
  return (
    <button
      className={`${sizeMap[size]} ${fullWidth ? 'w-full' : ''} bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-55 hover:bg-primary-dark active:scale-95 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : label}
    </button>
  );
}
