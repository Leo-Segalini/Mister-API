import React, { useEffect, useRef } from 'react';
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';

interface IntlTelInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
}

// Patch temporaire pour le typage utilsScript
const getOptions = () => ({
  initialCountry: 'fr',
  nationalMode: false,
  formatOnDisplay: true,
  autoPlaceholder: 'polite',
  separateDialCode: true,
  // @ts-ignore
  utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js',
});

const IntlTelInput: React.FC<IntlTelInputProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = '',
  id = 'telephone',
  name = 'telephone',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const itiRef = useRef<any>(null);

  useEffect(() => {
    if (inputRef.current) {
      itiRef.current = intlTelInput(inputRef.current, getOptions());
      inputRef.current.addEventListener('countrychange', handleCountryChange);
      inputRef.current.addEventListener('input', handleInputChange);
    }
    return () => {
      if (itiRef.current) {
        itiRef.current.destroy();
      }
      if (inputRef.current) {
        inputRef.current.removeEventListener('countrychange', handleCountryChange);
        inputRef.current.removeEventListener('input', handleInputChange);
      }
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleInputChange = () => {
    if (inputRef.current && itiRef.current) {
      const number = itiRef.current.getNumber();
      onChange(number);
    }
  };
  const handleCountryChange = () => {
    handleInputChange();
  };

  return (
    <input
      ref={inputRef}
      type="tel"
      id={id}
      name={name}
      className="w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
      placeholder={placeholder || '+33 6 12 34 56 78'}
      disabled={disabled}
      autoComplete="tel"
      defaultValue={value}
    />
  );
};

export default IntlTelInput; 