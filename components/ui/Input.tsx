
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ label, name, error, type = 'text', containerClassName = '', className = '', helperText, ...props }) => {
  const baseInputClasses = "w-full px-4 py-2 bg-gray-700 bg-opacity-50 border border-cinza-borda rounded-md text-branco-nav placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-azul-primario focus:border-transparent transition-colors";
  const errorInputClasses = "border-red-500 focus:ring-red-500";

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        className={`${baseInputClasses} ${error ? errorInputClasses : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-gray-400">{helperText}</p>}
    </div>
  );
};


interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, name, error, containerClassName = '', className = '', ...props }) => {
  const baseInputClasses = "w-full px-4 py-2 bg-gray-700 bg-opacity-50 border border-cinza-borda rounded-md text-branco-nav placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-azul-primario focus:border-transparent transition-colors";
  const errorInputClasses = "border-red-500 focus:ring-red-500";

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <textarea
        id={name}
        name={name}
        className={`${baseInputClasses} ${error ? errorInputClasses : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};


interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ label, name, error, options, containerClassName = '', className = '', ...props }) => {
  const baseSelectClasses = "w-full px-4 py-2.5 bg-gray-700 bg-opacity-50 border border-cinza-borda rounded-md text-branco-nav placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-azul-primario focus:border-transparent transition-colors appearance-none";
  const errorSelectClasses = "border-red-500 focus:ring-red-500";

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <div className="relative">
        <select
          id={name}
          name={name}
          className={`${baseSelectClasses} ${error ? errorSelectClasses : ''} ${className}`}
          {...props}
        >
          {props.placeholder && <option value="" disabled>{props.placeholder}</option>}
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};


export default Input;