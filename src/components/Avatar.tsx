import React from 'react';
import { Crown } from 'lucide-react';
import { Participant } from '../types';

interface Props {
  participant: Participant;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Avatar: React.FC<Props> = ({ participant, size = 'md', showName = false, onClick, className = '' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  const nameClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-sm relative select-none transition-transform hover:scale-110`}
        style={{ backgroundColor: participant.avatarColor }}
        title={participant.name}
      >
        {participant.name.charAt(0)}
        {participant.isMainCharacter && (
          <Crown
            className="absolute -top-2 -right-1 w-4 h-4 text-yellow-400 drop-shadow-sm"
            fill="#FBBF24"
            strokeWidth={0}
          />
        )}
      </div>
      {showName && (
        <span className={`${nameClasses[size]} text-slate2-700 font-medium`}>
          {participant.name}
          {participant.isMainCharacter && (
            <span className="ml-1 text-xs bg-cream-200 text-yellow-700 px-1.5 py-0.5 rounded-full">主角</span>
          )}
        </span>
      )}
    </div>
  );
};
