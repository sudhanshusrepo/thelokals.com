import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pending' | 'approved' | 'rejected' | 'active' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold';
  
  const variantStyles = {
    pending: 'bg-[#FEF3C7] text-[#92400E]',
    approved: 'bg-[#D1FAE5] text-[#065F46]',
    rejected: 'bg-[#FEE2E2] text-[#991B1B]',
    active: 'bg-[#DBEAFE] text-[#1E40AF]',
    default: 'bg-[#F1F5F9] text-[#64748B]'
  };
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
