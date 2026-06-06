import { Link } from 'react-router-dom';
import type { MBIType } from '@/types';
import { typeDetails } from '@/data/typeDetails';

interface TypeCardProps {
  type: MBIType;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export default function TypeCard({ type, size = 'medium', onClick }: TypeCardProps) {
  const detail = typeDetails[type];

  const sizeClasses = {
    small: 'p-3',
    medium: 'p-5',
    large: 'p-8',
  };

  const textSizeClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl',
  };

  const handleClick = () => {
    if (onClick) onClick();
  };

  const CardContent = (
    <div
      onClick={handleClick}
      className={`${sizeClasses[size]} glass-card neon-border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group`}
      style={{ boxShadow: `0 0 20px ${detail.color}30` }}
    >
      <div className="text-center">
        <h3
          className={`${textSizeClasses[size]} font-display font-bold mb-2 transition-colors duration-300`}
          style={{ color: detail.color }}
        >
          {type}
        </h3>
        <p className="text-white/80 font-medium">{detail.name}</p>
        {size !== 'small' && (
          <p className="text-white/50 text-sm mt-1">{detail.nickname}</p>
        )}
        {size === 'large' && (
          <p className="text-white/60 text-sm mt-3 leading-relaxed">
            {detail.description}
          </p>
        )}
      </div>
      
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${detail.color}20 0%, transparent 70%)`,
        }}
      />
    </div>
  );

  if (onClick) {
    return CardContent;
  }

  return (
    <Link to={`/detail/${type}`} className="block">
      {CardContent}
    </Link>
  );
}
