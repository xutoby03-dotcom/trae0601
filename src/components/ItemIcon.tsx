import React from 'react';
import { ItemType } from '@/types';

interface ItemIconProps {
  type: ItemType;
  size?: number;
  className?: string;
}

const ItemIcon: React.FC<ItemIconProps> = ({ type, size = 40, className = '' }) => {
  const renderPot = () => (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <ellipse cx="50" cy="55" rx="35" ry="30" fill="#8B4513" stroke="#5D4037" strokeWidth="2" />
      <ellipse cx="50" cy="30" rx="20" ry="10" fill="#A0522D" stroke="#5D4037" strokeWidth="2" />
      <circle cx="50" cy="22" r="6" fill="#8B4513" stroke="#5D4037" strokeWidth="1.5" />
      <path d="M 85 50 Q 95 45, 92 55 Q 90 60, 82 58" fill="#A0522D" stroke="#5D4037" strokeWidth="2" />
      <path d="M 15 45 Q 5 40, 8 55 Q 10 62, 18 58" fill="#A0522D" stroke="#5D4037" strokeWidth="2" />
      <ellipse cx="50" cy="55" rx="28" ry="22" fill="none" stroke="#D2691E" strokeWidth="1" opacity="0.5" />
    </svg>
  );

  const renderGongdao = () => (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <ellipse cx="45" cy="55" rx="32" ry="28" fill="#DEB887" stroke="#8B7355" strokeWidth="2" />
      <ellipse cx="45" cy="35" rx="18" ry="8" fill="#F5DEB3" stroke="#8B7355" strokeWidth="2" />
      <path d="M 75 40 Q 90 38, 92 48 Q 90 55, 80 52" fill="#DEB887" stroke="#8B7355" strokeWidth="2" />
      <ellipse cx="45" cy="55" rx="25" ry="20" fill="none" stroke="#D2B48C" strokeWidth="1" opacity="0.5" />
      <path d="M 20 45 Q 12 42, 10 50 Q 12 56, 20 54" fill="#DEB887" stroke="#8B7355" strokeWidth="1.5" />
    </svg>
  );

  const renderCup = () => (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <ellipse cx="50" cy="50" rx="28" ry="25" fill="#F5F5DC" stroke="#8B8B7A" strokeWidth="2" />
      <ellipse cx="50" cy="30" rx="20" ry="10" fill="#FFFFF0" stroke="#8B8B7A" strokeWidth="2" />
      <ellipse cx="50" cy="50" rx="22" ry="18" fill="none" stroke="#D3D3B0" strokeWidth="1" opacity="0.6" />
      <ellipse cx="50" cy="30" rx="14" ry="6" fill="#E8E8D0" opacity="0.5" />
    </svg>
  );

  const renderIncense = () => (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <ellipse cx="50" cy="70" rx="30" ry="10" fill="#696969" stroke="#2F2F2F" strokeWidth="2" />
      <rect x="47" y="20" width="6" height="50" fill="#8B7355" rx="2" />
      <ellipse cx="50" cy="18" rx="4" ry="6" fill="#FF6347" opacity="0.8" />
      <path d="M 48 10 Q 45 5, 50 2 Q 55 5, 52 10" fill="#808080" opacity="0.4" />
      <path d="M 50 5 Q 52 0, 48 -3" fill="#A9A9A9" opacity="0.3" />
      <ellipse cx="50" cy="70" rx="22" ry="6" fill="#808080" opacity="0.3" />
    </svg>
  );

  const renderTeaLeaf = () => (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <ellipse cx="50" cy="55" rx="38" ry="22" fill="#F5DEB3" stroke="#8B7355" strokeWidth="2" />
      <ellipse cx="50" cy="45" rx="30" ry="12" fill="#FAEBD7" stroke="#8B7355" strokeWidth="1.5" />
      <ellipse cx="40" cy="48" rx="4" ry="3" fill="#556B2F" />
      <ellipse cx="50" cy="50" rx="3" ry="2" fill="#6B8E23" />
      <ellipse cx="60" cy="47" rx="4" ry="3" fill="#556B2F" />
      <ellipse cx="55" cy="52" rx="3" ry="2" fill="#6B8E23" />
      <ellipse cx="45" cy="51" rx="2" ry="2" fill="#808000" />
      <ellipse cx="50" cy="55" rx="32" ry="15" fill="none" stroke="#D2B48C" strokeWidth="1" opacity="0.5" />
    </svg>
  );

  const renderFlower = () => (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <ellipse cx="50" cy="80" rx="20" ry="8" fill="#8B4513" stroke="#5D4037" strokeWidth="2" />
      <rect x="42" y="45" width="16" height="35" fill="#A0522D" stroke="#8B4513" strokeWidth="1.5" rx="2" />
      <ellipse cx="50" cy="45" rx="12" ry="5" fill="#CD853F" stroke="#8B4513" strokeWidth="1.5" />
      <line x1="50" y1="45" x2="50" y2="15" stroke="#228B22" strokeWidth="2" />
      <ellipse cx="35" cy="25" rx="10" ry="8" fill="#FFB6C1" stroke="#FF69B4" strokeWidth="1" transform="rotate(-30 35 25)" />
      <ellipse cx="65" cy="25" rx="10" ry="8" fill="#FFB6C1" stroke="#FF69B4" strokeWidth="1" transform="rotate(30 65 25)" />
      <ellipse cx="50" cy="15" rx="9" ry="10" fill="#FFC0CB" stroke="#FF69B4" strokeWidth="1" />
      <circle cx="50" cy="18" r="4" fill="#FFD700" />
      <ellipse cx="25" cy="35" rx="6" ry="4" fill="#90EE90" transform="rotate(-45 25 35)" />
      <ellipse cx="75" cy="35" rx="6" ry="4" fill="#90EE90" transform="rotate(45 75 35)" />
    </svg>
  );

  const renderByType = () => {
    switch (type) {
      case 'pot':
        return renderPot();
      case 'gongdao':
        return renderGongdao();
      case 'cup':
        return renderCup();
      case 'incense':
        return renderIncense();
      case 'teaLeaf':
        return renderTeaLeaf();
      case 'flower':
        return renderFlower();
      default:
        return null;
    }
  };

  return renderByType();
};

export default ItemIcon;
