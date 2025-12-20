import React, { useState, useEffect, useRef } from 'react';

interface DateInputProps {
  label?: string;
  value: string; // ISO format (YYYY-MM-DD)
  onChange: (e: { target: { value: string } }) => void;
  error?: boolean;
  required?: boolean;
  className?: string;
}

// Convert ISO date (YYYY-MM-DD) to German format (DD.MM.YYYY)
const isoToGerman = (isoDate: string): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return '';
  return `${day}.${month}.${year}`;
};

// Convert German format (DD.MM.YYYY) to ISO date (YYYY-MM-DD)
const germanToIso = (germanDate: string): string => {
  if (!germanDate) return '';
  const parts = germanDate.split('.');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts;
  if (!day || !month || !year) return '';
  // Validate the date
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return '';
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) return '';
  if (yearNum < 1900 || yearNum > 2100) return '';
  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Check if a string is a valid German date format
const isValidGermanDate = (value: string): boolean => {
  const regex = /^\d{1,2}\.\d{1,2}\.\d{4}$/;
  if (!regex.test(value)) return false;
  const isoDate = germanToIso(value);
  if (!isoDate) return false;
  const date = new Date(isoDate);
  return !isNaN(date.getTime());
};

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(isoToGerman(value));
  const [isFocused, setIsFocused] = useState(false);
  const [showNativePicker, setShowNativePicker] = useState(false);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Sync display value when prop value changes (from outside)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(isoToGerman(value));
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);

    // Try to convert to ISO and call onChange if valid
    const isoDate = germanToIso(newValue);
    if (isoDate && isValidGermanDate(newValue)) {
      onChange({ target: { value: isoDate } });
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // On blur, format the date properly if valid
    const isoDate = germanToIso(displayValue);
    if (isoDate && isValidGermanDate(displayValue)) {
      setDisplayValue(isoToGerman(isoDate));
      onChange({ target: { value: isoDate } });
    } else if (!displayValue) {
      onChange({ target: { value: '' } });
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  // Handle native date picker
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value;
    if (isoDate) {
      setDisplayValue(isoToGerman(isoDate));
      onChange({ target: { value: isoDate } });
    }
    setShowNativePicker(false);
  };

  const openNativePicker = () => {
    if (nativeInputRef.current) {
      nativeInputRef.current.showPicker?.();
      setShowNativePicker(true);
    }
  };

  return (
    <div className={`flex-1 min-w-[100px] ${className || ''}`}>
      {label && (
        <label className="block text-sm font-medium text-on-surface mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="TT.MM.JJJJ"
          className={`w-full bg-background border ${
            error ? 'border-red-500' : 'border-muted'
          } rounded-md px-3 py-2 pr-10 text-on-surface-strong focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none`}
          required={required}
        />
        {/* Calendar icon button to open native picker */}
        <button
          type="button"
          onClick={openNativePicker}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-on-surface transition-colors p-1"
          title="Kalender öffnen"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>
        {/* Hidden native date input for picker */}
        <input
          ref={nativeInputRef}
          type="date"
          value={value}
          onChange={handleNativeDateChange}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          tabIndex={-1}
        />
      </div>
      <p className="text-xs text-muted mt-1">Format: TT.MM.JJJJ</p>
    </div>
  );
};










