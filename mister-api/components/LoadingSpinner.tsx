'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'white' | 'green' | 'blue' | 'purple' | 'yellow' | 'gray';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'green', 
  variant = 'spinner',
  className = '' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    white: 'border-white',
    green: 'border-green-400',
    blue: 'border-blue-400',
    purple: 'border-purple-400',
    yellow: 'border-yellow-400',
    gray: 'border-gray-400'
  };

  const bgColorClasses = {
    white: 'bg-white',
    green: 'bg-green-400',
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    yellow: 'bg-yellow-400',
    gray: 'bg-gray-400'
  };

  // Variant Spinner (par défaut)
  if (variant === 'spinner') {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full ${className}`}
      />
    );
  }

  // Variant Dots
  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: index * 0.2,
              ease: 'easeInOut'
            }}
            className={`${sizeClasses.sm} ${bgColorClasses[color]} rounded-full`}
          />
        ))}
      </div>
    );
  }

  // Variant Pulse
  if (variant === 'pulse') {
    return (
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`${sizeClasses[size]} ${bgColorClasses[color]} rounded-full ${className}`}
      />
    );
  }

  return null;
};

export default LoadingSpinner; 