import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 500 }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{hint}</div>}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ style, ...rest }) => (
  <input
    style={{
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
      ...style
    }}
    onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'}
    onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
    {...rest}
  />
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea: React.FC<TextAreaProps> = ({ style, ...rest }) => (
  <textarea
    style={{
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      fontSize: 14,
      outline: 'none',
      resize: 'vertical',
      minHeight: 80,
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      ...style
    }}
    onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'}
    onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
    {...rest}
  />
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({ style, children, ...rest }) => (
  <select
    style={{
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      fontSize: 14,
      outline: 'none',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      ...style
    }}
    onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'}
    onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
    {...rest}
  >
    {children}
  </select>
);
