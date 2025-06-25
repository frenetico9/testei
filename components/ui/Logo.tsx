
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../constants';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '', showText = true }) => {
  const sizeClasses = {
    small: 'h-8 w-8', // Icon size
    medium: 'h-10 w-10',
    large: 'h-12 w-12',
  };
  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  }

  return (
    <Link to="/" className={`flex items-center space-x-2 text-branco-nav hover:opacity-90 transition-opacity ${className}`}>
      {/* Simplified SVG Logo: Razor and Comb */}
      <svg 
        className={sizeClasses[size]} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Navalha Digital Logo Icon"
      >
        {/* Comb */}
        <rect x="20" y="30" width="60" height="10" rx="2" fill="currentColor"/>
        <path d="M20 45 L20 65 M30 45 L30 70 M40 45 L40 65 M50 45 L50 70 M60 45 L60 65 M70 45 L70 70 M80 45 L80 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        
        {/* Razor - simplified */}
        <g transform="rotate(-30 50 50) translate(-5 -5)">
            <rect x="30" y="60" width="50" height="8" rx="2" fill="currentColor" transform="rotate(45 30 60)" />
            <path d="M50 25 L75 50 L65 60 L40 35 Z" fill="currentColor" />
             <rect x="25" y="58" width="8" height="25" rx="2" fill="currentColor" transform="rotate(45 25 58)" />
        </g>
      </svg>
      {showText && <span className={`font-roboto-slab font-bold ${textSizeClasses[size]}`}>{APP_NAME}</span>}
    </Link>
  );
};

export default Logo;
    