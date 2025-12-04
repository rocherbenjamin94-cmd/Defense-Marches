import React from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative inline-block group ml-2 align-middle">
      <span className="cursor-help text-gray-500 hover:text-gray-300 flex items-center">
        {children || <Info className="w-4 h-4" />}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 
                      bg-[#1a1a24] border border-[#2a2a34] rounded-lg text-sm text-gray-300
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-200 whitespace-nowrap z-50
                      shadow-lg shadow-black/50 pointer-events-none min-w-max">
        {content}
        {/* Flèche */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 
                        border-4 border-transparent border-t-[#2a2a34]" />
      </div>
    </div>
  );
}
