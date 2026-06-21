import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface PhotoCompareProps {
  photoSmooth: string;
  photoWrinkled: string;
  fabricName: string;
}

export function PhotoCompare({ photoSmooth, photoWrinkled, fabricName }: PhotoCompareProps) {
  const [activeTab, setActiveTab] = useState<'smooth' | 'wrinkled'>('smooth');
  const [showModal, setShowModal] = useState(false);

  const activePhoto = activeTab === 'smooth' ? photoSmooth : photoWrinkled;
  const activeLabel = activeTab === 'smooth' ? '平整状态' : '揉皱状态';

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#8B5A3C]/10">
      <div className="flex border-b border-[#8B5A3C]/10">
        <button
          onClick={() => setActiveTab('smooth')}
          className={`flex-1 py-3 text-sm font-medium transition-all ${
            activeTab === 'smooth'
              ? 'bg-[#8B5A3C]/5 text-[#8B5A3C] border-b-2 border-[#8B5A3C]'
              : 'text-[#8B5A3C]/50 hover:text-[#8B5A3C]/70 hover:bg-[#8B5A3C]/[0.02]'
          }`}
        >
          平整状态
        </button>
        <button
          onClick={() => setActiveTab('wrinkled')}
          className={`flex-1 py-3 text-sm font-medium transition-all ${
            activeTab === 'wrinkled'
              ? 'bg-[#3D5A45]/5 text-[#3D5A45] border-b-2 border-[#3D5A45]'
              : 'text-[#8B5A3C]/50 hover:text-[#8B5A3C]/70 hover:bg-[#8B5A3C]/[0.02]'
          }`}
        >
          揉皱状态
        </button>
      </div>

      <div className="relative aspect-square bg-[#F8F4ED]">
        <img
          src={activePhoto}
          alt={`${fabricName} - ${activeLabel}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        <button
          onClick={() => setShowModal(true)}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
        >
          <ZoomIn size={18} className="text-[#8B5A3C]" />
        </button>

        <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 rounded-full">
          <span className="text-xs font-medium text-[#8B5A3C]">{activeLabel}</span>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          onClick={() => setShowModal(false)}
        >
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="max-w-4xl max-h-full overflow-auto">
            <img
              src={activePhoto}
              alt={`${fabricName} - ${activeLabel} (放大)`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-center text-white/80 mt-4 text-sm">
              {fabricName} - {activeLabel}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
