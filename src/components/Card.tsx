import '../styles/components.css';

export type CardPadding = 'sm' | 'md' | 'lg';

export interface CardProps {
  padding?: CardPadding;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ padding = 'md', children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`card card-${padding} ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {children}
    </div>
  );
}
