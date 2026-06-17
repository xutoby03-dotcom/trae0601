import { useState, useEffect } from 'react';

const PhotoThumb = ({ src, alt = '', style, className }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError || !src) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '12px',
          borderRadius: '4px',
          ...style,
        }}
        className={className}
      >
        不可用
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '4px',
        ...style,
      }}
      className={className}
    />
  );
};

export default PhotoThumb;
