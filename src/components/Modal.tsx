import React from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children, width = 480 }) => {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div
        style={{
          backgroundColor: 'white', borderRadius: 12, width, maxWidth: '90vw',
          maxHeight: '90vh', overflow: 'auto', padding: 24
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
              color: '#999', padding: 0, lineHeight: 1
            }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ModalActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
    {children}
  </div>
);
