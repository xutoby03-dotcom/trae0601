import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FlaskConical, Home, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Cabinet, BuildingType } from '@/types';
import { useStockAlert } from '@/hooks/useStockAlert';

interface CabinetCardProps {
  cabinet: Cabinet;
  index: number;
}

const buildingIcons: Record<BuildingType, React.ReactNode> = {
  sports: <Building2 className="w-8 h-8" />,
  lab: <FlaskConical className="w-8 h-8" />,
  dormitory: <Home className="w-8 h-8" />,
};

const buildingColors: Record<BuildingType, string> = {
  sports: 'from-blue-500 to-cyan-500',
  lab: 'from-purple-500 to-indigo-500',
  dormitory: 'from-emerald-500 to-teal-500',
};

export const CabinetCard: React.FC<CabinetCardProps> = ({ cabinet, index }) => {
  const navigate = useNavigate();
  const { getAlertsByBuilding } = useStockAlert();
  
  const alerts = getAlertsByBuilding(cabinet.building);
  const hasWarnings = alerts.length > 0;
  const expiredCount = alerts.filter(a => a.status === 'expired').length;
  const lowStockCount = alerts.filter(a => a.status === 'insufficient').length;
  
  const handleClick = () => {
    navigate(`/cabinet/${cabinet.id}`);
  };
  
  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`h-32 bg-gradient-to-br ${buildingColors[cabinet.building]} p-6 flex items-center justify-between text-white`}>
        <div>
          <h3 className="text-xl font-bold mb-1">{cabinet.name}</h3>
          <p className="text-white/80 text-sm">{cabinet.location}</p>
        </div>
        <div className="opacity-80 group-hover:scale-110 transition-transform">
          {buildingIcons[cabinet.building]}
        </div>
      </div>
      
      <div className="p-5">
        {hasWarnings ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-600">
              <AlertTriangle className="w-4 h-4 animate-pulse-soft" />
              <span className="text-sm font-medium">有告警</span>
            </div>
            <div className="flex gap-2">
              {expiredCount > 0 && (
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">
                  {expiredCount} 个过期
                </span>
              )}
              {lowStockCount > 0 && (
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">
                  {lowStockCount} 个缺货
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">状态正常</span>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-gray-500 text-sm">点击查看详情</span>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
            <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
