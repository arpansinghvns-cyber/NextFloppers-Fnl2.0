import React from 'react';
import { motion } from 'motion/react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className}`}
      initial="initial"
      animate="animate"
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="rocket-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="orange-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shadow Trail */}
        <motion.path
          d="M20 80 L50 20 L80 80 L50 65 Z"
          fill="url(#rocket-grad)"
          opacity="0.2"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Orange Accent Arrow (Next Toppers Style) */}
        <motion.path
          d="M15 85 L45 25 L55 25 L25 85 Z"
          fill="url(#orange-grad)"
          animate={{
            x: [-2, 2, -2],
            y: [2, -2, 2],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Blue Rocket Body */}
        <motion.path
          d="M30 75 L60 15 L90 75 L60 60 Z"
          fill="url(#rocket-grad)"
          filter="url(#glow)"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Center Power Core */}
        <motion.circle
          cx="60"
          cy="45"
          r="4"
          fill="white"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />

        {/* Dynamic Speed Lines */}
        {[0, 1, 2].map((i) => (
          <motion.line
            key={i}
            x1={20 - i * 5}
            y1={85 + i * 5}
            x2={10 - i * 5}
            y2={95 + i * 5}
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              pathLength: [0, 1, 1],
              x: [-10, 10],
              y: [10, -10]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              delay: i * 0.3,
              ease: "linear"
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
};
