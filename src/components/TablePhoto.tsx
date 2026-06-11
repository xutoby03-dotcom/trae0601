import { useState, useEffect } from 'react';

export type TablePhotoSize = 'sm' | 'md' | 'lg' | 'xl';

interface TablePhotoProps {
  photo?: string;
  tableNumber: string;
  size?: TablePhotoSize;
  className?: string;
}

const SIZE_CLASSES: Record<TablePhotoSize, string> = {
  sm: 'w-10 h-10 rounded-lg text-xs',
  md: 'w-12 h-12 rounded-xl text-sm',
  lg: 'w-14 h-14 rounded-xl text-sm',
  xl: 'w-20 h-20 rounded-2xl text-base',
};

export default function TablePhoto({ photo, tableNumber, size = 'md', className = '' }: TablePhotoProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photo]);

  const sizeClass = SIZE_CLASSES[size];
  const baseClass = `${sizeClass} ${className}`.trim();

  if (photo && !imgError) {
    return (
      <img
        src={photo}
        alt={tableNumber}
        className={`${baseClass} object-cover bg-gray-100`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${baseClass} bg-gradient-to-br from-warm-200 to-warm-300 flex items-center justify-center text-warm-600 font-semibold`}>
      {tableNumber.charAt(0)}
    </div>
  );
}
