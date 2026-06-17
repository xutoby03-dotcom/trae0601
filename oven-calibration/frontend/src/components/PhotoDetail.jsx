import { useState, useEffect } from 'react';

const PhotoDetail = ({ src, alt = '', style, className }) => {
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
          minHeight: '200px',
          border: '2px dashed #d9d9d9',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          backgroundColor: '#fafafa',
          ...style,
        }}
        className={className}
      >
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📷</div>
        <div style={{ fontSize: '14px' }}>图片加载失败或暂无图片</div>
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
        height: 'auto',
        maxHeight: '500px',
        objectFit: 'contain',
        borderRadius: '8px',
        ...style,
      }}
      className={className}
    />
  );
};

export default PhotoDetail;
