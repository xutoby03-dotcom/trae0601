import React from 'react';
import { Check } from 'lucide-react';
import { COLOR_OPTIONS } from '@/utils/constants';

interface ColorPickerProps {
  value: string;
  onChange: (color: string, colorHex: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {COLOR_OPTIONS.map((color) => {
          const isSelected = value === color.name;
          return (
            <button
              key={color.name}
              type="button"
              onClick={() => onChange(color.name, color.hex)}
              className={`
                group relative w-10 h-10 rounded-full border-2 transition-all duration-200
                hover:scale-110 hover:shadow-lg
                ${isSelected ? 'border-[#4A90D9] scale-110 shadow-lg' : 'border-gray-200'}
              `}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {isSelected && (
                <Check
                  className={`w-5 h-5 absolute inset-0 m-auto ${
                    color.name === '黑色' || color.name === '深蓝' ? 'text-white' : 'text-gray-800'
                  }`}
                />
              )}
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
      {value && (
        <p className="mt-6 text-sm text-gray-600">
          已选择：<span className="font-medium">{value}</span>
        </p>
      )}
    </div>
  );
};
