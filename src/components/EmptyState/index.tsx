import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          marginBottom: 20,
          color: '#d9d9d9',
        }}
      >
        {icon || <Inbox size={80} strokeWidth={1} />}
      </div>
      <h3
        style={{
          margin: 0,
          marginBottom: 8,
          fontSize: 16,
          fontWeight: 500,
          color: '#333',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: 0,
            marginBottom: 24,
            fontSize: 14,
            color: '#999',
            lineHeight: 1.6,
            maxWidth: 400,
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
