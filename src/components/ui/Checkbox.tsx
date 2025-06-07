import React, { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  id: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex items-start mb-4">
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          className={`h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary ${className}`}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={id} className="font-medium text-neutral-700">
          {label}
        </label>
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    </div>
  );
};

export default Checkbox;