import React from 'react';

interface FormInputProps {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  autoFocus?: boolean;
  pattern?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  autoFocus = false,
  pattern,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoFocus={autoFocus}
        pattern={pattern}
        className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FormInput;