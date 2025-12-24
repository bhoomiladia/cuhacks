'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function CustomToggle({ checked, onChange, className }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none",
        checked ? "bg-[#FC90AF]/20" : "bg-white/5",
        "border border-white/10",
        className
      )}
    >
      {/* Track Glow */}
      {checked && (
        <div className="absolute inset-0 rounded-full bg-[#FC90AF]/5 blur-sm" />
      )}

      {/* The Sliding Knob */}
      <motion.div
        initial={false}
        animate={{ x: checked ? 22 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute top-1 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
          checked 
            ? "bg-[#FC90AF] shadow-[0_0_12px_rgba(252,144,175,0.8)]" 
            : "bg-gray-600 shadow-inner"
        )}
      >
        {/* Interior Detail */}
        <div className={cn(
          "w-1 h-1 rounded-full",
          checked ? "bg-white" : "bg-gray-400"
        )} />
      </motion.div>
    </button>
  );
}