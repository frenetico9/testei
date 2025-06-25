
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
  actions?: React.ReactNode; // e.g., buttons or links in the card header
}

const Card: React.FC<CardProps> = ({ children, className = '', title, titleClassName = '', actions }) => {
  return (
    <div className={`bg-azul-marinho bg-opacity-70 shadow-xl rounded-lg overflow-hidden border border-cinza-borda backdrop-blur-sm ${className}`}>
      {(title || actions) && (
        <div className="px-4 py-3 sm:px-6 border-b border-cinza-borda flex justify-between items-center">
          {title && <h3 className={`text-lg leading-6 font-medium text-branco-nav font-roboto-slab ${titleClassName}`}>{title}</h3>}
          {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;