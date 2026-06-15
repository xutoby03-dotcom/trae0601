import { useState } from 'react';
import { Image as ImageIcon, X, ZoomIn } from 'lucide-react';

interface ReferenceImageProps {
  imageUrl?: string;
  orderNo: string;
}

export default function ReferenceImage({ imageUrl, orderNo }: ReferenceImageProps) {
  const [showModal, setShowModal] = useState(false);

  if (!imageUrl) {
    return (
      <div className="aspect-video bg-cream-200/60 rounded-lg flex flex-col items-center justify-center text-coffee-800/40 border-2 border-dashed border-cream-300">
        <ImageIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">暂无参考图</span>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="aspect-video rounded-lg overflow-hidden bg-cream-200 relative group cursor-pointer shadow-inner"
      >
        <img
          src={imageUrl}
          alt={`参考图 ${orderNo}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-3xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={imageUrl}
              alt={`参考图 ${orderNo}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="text-center text-white/70 text-sm mt-4">
              订单号：{orderNo} · 点击任意处关闭
            </p>
          </div>
        </div>
      )}
    </>
  );
}
