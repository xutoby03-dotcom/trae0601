import { useNavigate } from 'react-router-dom';
import { MapPin, User, Calendar } from 'lucide-react';
import type { ArchiveBox } from '../../types';
import { StatusBadge, SecurityBadge } from '../ui/Badges';

interface ArchiveCardProps {
  box: ArchiveBox;
  index?: number;
}

export function ArchiveCard({ box, index = 0 }: ArchiveCardProps) {
  const navigate = useNavigate();
  const coverPhoto = box.photos.find((p) => p.photoType === '外观') || box.photos[0];

  return (
    <div
      onClick={() => navigate(`/archives/${box.id}`)}
      className="card-hoverable overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative h-36 bg-gradient-to-br from-navy-50 to-navy-100 overflow-hidden">
        {coverPhoto ? (
          <img
            src={coverPhoto.photoUrl}
            alt={box.boxNumber}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-navy-300">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <SecurityBadge level={box.securityLevel} />
        </div>
        <div className="absolute top-2 right-2">
          <StatusBadge status={box.status} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-serif text-base font-semibold text-navy-900 truncate">{box.boxNumber}</h4>
          <span className="text-xs text-gray-500 whitespace-nowrap">{box.year}年</span>
        </div>
        {box.clientName && (
          <p className="text-sm text-gray-600 mb-3 truncate">{box.clientName}</p>
        )}
        <div className="space-y-1.5 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            <span className="truncate">{box.cabinetLocation}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User size={12} />
            <span className="truncate">{box.department} · {box.custodian}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>封条号：{box.sealNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
