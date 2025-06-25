
import React, { useEffect } from 'react';
import { X } from 'lucide-react'; // Using lucide-react for icons

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'; // Added more sizes
  footer?: React.ReactNode;
  bodyClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', footer, bodyClassName = '' }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      onClick={onClose} // Close on backdrop click
    >
      <div 
        className={`bg-azul-marinho text-branco-nav rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all duration-300 border border-cinza-borda ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-cinza-borda">
          {title && <h3 className="text-xl font-roboto-slab font-semibold">{title}</h3>}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-branco-nav transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <div className={`p-6 max-h-[70vh] overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-cinza-borda flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;