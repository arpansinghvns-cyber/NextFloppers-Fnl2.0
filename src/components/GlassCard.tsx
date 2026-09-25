import React from 'react';
import { cn } from '../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  variant = 'light',
  ...props 
}) => {
  return (
    <motion.div
      className={cn(
        'rounded-2xl overflow-hidden',
        variant === 'light' && 'glass',
        variant === 'dark' && 'glass-dark',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
