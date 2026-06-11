import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', style, children, ...rest }) => {
  const base: React.CSSProperties = {
    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500,
    transition: 'all 0.2s'
  };

  const sizeStyle: React.CSSProperties = size === 'sm'
    ? { padding: '6px 14px', fontSize: 13 }
    : { padding: '10px 20px', fontSize: 14 };

  const variantStyle: React.CSSProperties = {
    primary: { backgroundColor: '#4f46e5', color: 'white' },
    secondary: { backgroundColor: '#f1f5f9', color: '#334155' },
    danger: { backgroundColor: '#ef4444', color: 'white' },
    success: { backgroundColor: '#10b981', color: 'white' }
  }[variant];

  return (
    <button style={{ ...base, ...sizeStyle, ...variantStyle, ...style }} {...rest}>
      {children}
    </button>
  );
};
