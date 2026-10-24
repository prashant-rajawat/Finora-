import React from 'react';

interface FinoraLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FinoraLogo: React.FC<FinoraLogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
}) => {
  const barHeights = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Finora 3-bar logo mark matching reference design */}
      <div className={`flex items-end gap-1 ${barHeights[size]}`}>
        <span className="w-1.5 h-3/5 bg-[#1677F2]/60 rounded-full"></span>
        <span className="w-1.5 h-full bg-[#1677F2] rounded-full shadow-sm shadow-[#1677F2]/30"></span>
        <span className="w-1.5 h-4/5 bg-[#1677F2]/80 rounded-full"></span>
      </div>
      {!iconOnly && (
        <span className={`font-bold tracking-tight text-[#203451] ${textSizes[size]}`}>
          Finora
        </span>
      )}
    </div>
  );
};
