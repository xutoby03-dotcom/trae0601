import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface ComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function ComboBox({
  value,
  onChange,
  options,
  placeholder = '请选择或输入...',
  icon,
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
  };

  const handleSelectOption = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  const filteredOptions = options.filter(
    (opt) => opt.toLowerCase().includes(inputValue.toLowerCase()) && opt !== inputValue
  );

  const isExactMatch = options.some((opt) => opt === value);

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`flex items-center gap-2 px-4 py-3 bg-slate-800/50 backdrop-blur-md 
                    border rounded-xl transition-all cursor-text
                    ${
                      isOpen
                        ? 'border-cyan-500/50 ring-2 ring-cyan-500/20'
                        : 'border-slate-700/50 hover:border-slate-600/50'
                    }`}
        onClick={() => setIsOpen(true)}
      >
        {icon && <span className="text-cyan-400 flex-shrink-0">{icon}</span>}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
        />
        {value && !isExactMatch && (
          <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full flex-shrink-0">
            自定义
          </span>
        )}
        <ChevronDown
          size={18}
          className={`text-slate-400 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-20 w-full mt-2 py-2 bg-slate-800 border border-slate-700 
                        rounded-xl shadow-xl backdrop-blur-lg max-h-64 overflow-y-auto">
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelectOption(option)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2
                         ${
                           value === option
                             ? 'bg-cyan-500/10 text-cyan-400'
                             : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                         }`}
            >
              {value === option && <Check size={16} className="flex-shrink-0" />}
              <span className={value === option ? '' : 'ml-6'}>{option}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
