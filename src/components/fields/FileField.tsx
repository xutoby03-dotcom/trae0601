import { Upload, File, X } from 'lucide-react';
import { useState } from 'react';
import type { FormField } from '../../types/form';

interface FileFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function FileField({ field, value = '', onChange, disabled }: FileFieldProps) {
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange?.(file.name);
    }
  };

  const clearFile = () => {
    setFileName('');
    onChange?.('');
  };

  return (
    <div className="w-full">
      {fileName ? (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <File className="text-blue-600 flex-shrink-0" size={24} />
          <span className="flex-1 text-blue-700 font-medium truncate">{fileName}</span>
          {!disabled && (
            <button
              type="button"
              onClick={clearFile}
              className="p-1 hover:bg-blue-100 rounded transition-colors"
            >
              <X size={18} className="text-blue-600" />
            </button>
          )}
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Upload className="text-gray-400 mb-2" size={32} />
          <span className="text-gray-500 text-sm">
            {field.placeholder || '点击上传文件'}
          </span>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
