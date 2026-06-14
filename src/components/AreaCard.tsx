import React from 'react';
import { Area, ClothesRecord } from '../types';
import { ClothesCard } from './ClothesCard';

interface AreaCardProps {
  area: Area;
  records: ClothesRecord[];
  onCollect: (record: ClothesRecord) => void;
}

export const AreaCard: React.FC<AreaCardProps> = ({ area, records, onCollect }) => {
  return (
    <div
      className="rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
      style={{
        background: `linear-gradient(135deg, ${area.gradientStart} 0%, ${area.gradientEnd} 100%)`
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{area.icon}</span>
          <div>
            <h3 className="text-xl font-bold text-gray-800 font-display">{area.name}</h3>
            <p className="text-sm text-gray-600">{area.description}</p>
          </div>
        </div>
        <div className="chip-sky">
          {records.length} 件衣物
        </div>
      </div>

      {records.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {records.map(record => (
            <ClothesCard
              key={record.id}
              record={record}
              onCollect={onCollect}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl block mb-2">🧺</span>
          <p>这里还没有晾晒衣物</p>
        </div>
      )}
    </div>
  );
};
