import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: string | number;
  helperText?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  valueDisplay,
  helperText,
  className = '',
  id,
  min = 0,
  max = 100,
  ...props
}) => {
  const generatedId = React.useId();
  const sliderId = id || generatedId;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        {label && (
          <label htmlFor={sliderId} className="block text-xs font-semibold text-navy-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        {valueDisplay !== undefined && (
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
            {valueDisplay}
          </span>
        )}
      </div>
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        className={`w-full h-1.5 bg-navy-200 rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-none ${className}`}
        {...props}
      />
      {helperText && <p className="mt-1 text-xs text-navy-500">{helperText}</p>}
    </div>
  );
};
