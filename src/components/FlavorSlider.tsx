import React from 'react';

interface FlavorSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const FlavorSlider: React.FC<FlavorSliderProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center gap-4 w-full">
      <span className="text-sm font-medium text-[#6F4E37] min-w-[48px] text-right">
        {label}
      </span>

      <div className="flex-1 relative">
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-[#F5E6D3] [&::-webkit-slider-runnable-track]:to-[#6F4E37]
            [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-gradient-to-r [&::-moz-range-track]:from-[#F5E6D3] [&::-moz-range-track]:to-[#6F4E37]
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6F4E37] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:-mt-[6px] [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#6F4E37] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
        />
      </div>

      <span className="text-sm font-semibold text-[#6F4E37] min-w-[24px] text-center">
        {value}
      </span>
    </div>
  );
};

export default FlavorSlider;
