import { X, Clock, Droplets, Leaf, User, MapPin, Calendar, AlertTriangle, Package } from 'lucide-react';
import { Batch, Tea } from '@/types';
import StatusBadge from './StatusBadge';
import Countdown from './Countdown';
import { formatDateTime } from '@/utils/time';

interface BatchDetailProps {
  batch: Batch;
  tea: Tea | undefined;
  onClose: () => void;
  onFilter: () => void;
  onOffShelf: () => void;
}

export default function BatchDetail({ batch, tea, onClose, onFilter, onOffShelf }: BatchDetailProps) {
  if (!tea) return null;
  
  const outputRate = batch.outputAmountMl && batch.waterAmountMl 
    ? ((batch.outputAmountMl / batch.waterAmountMl) * 100).toFixed(1)
    : null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="relative h-32 flex items-end p-6"
          style={{ background: `linear-gradient(135deg, ${tea.color}dd, ${tea.color}88)` }}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="text-white">
            <h2 className="text-2xl font-bold font-serif">{tea.name}</h2>
            <p className="text-white/80 text-sm">桶号 {batch.bucketNumber} · {batch.waterAmountMl}ml</p>
          </div>
        </div>
        
        <div className="px-6 py-4 border-b border-gray-100">
          <StatusBadge status={batch.status} />
        </div>
        
        <div className="p-6 space-y-4">
          {batch.status !== 'filtered' && batch.status !== 'off_shelf' && (
            <div className="bg-matcha-50 rounded-2xl p-4 text-center">
              <p className="text-sm text-matcha-600 mb-2">距离过滤还有</p>
              <Countdown targetTime={batch.targetFilterTime} size="lg" />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                开始时间
              </div>
              <p className="text-gray-800 font-medium">{formatDateTime(batch.startTime)}</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Clock className="w-4 h-4" />
                目标过滤
              </div>
              <p className="text-gray-800 font-medium">{formatDateTime(batch.targetFilterTime)}</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Droplets className="w-4 h-4 text-blue-400" />
                水量
              </div>
              <p className="text-gray-800 font-medium">{batch.waterAmountMl} ml</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Leaf className="w-4 h-4 text-matcha-500" />
                投茶量
              </div>
              <p className="text-gray-800 font-medium">{batch.teaAmountG} g</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <User className="w-4 h-4 text-amber-500" />
                操作人
              </div>
              <p className="text-gray-800 font-medium">{batch.operator || '-'}</p>
            </div>
            
            {batch.shelfLocation && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <MapPin className="w-4 h-4 text-coral-500" />
                  存放位置
                </div>
                <p className="text-gray-800 font-medium">{batch.shelfLocation}</p>
              </div>
            )}
          </div>
          
          {batch.actualFilterTime && (
            <div className="bg-forest-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-forest-600 text-sm mb-1">
                <Package className="w-4 h-4" />
                过滤信息
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">过滤时间: </span>
                  <span className="text-gray-800">{formatDateTime(batch.actualFilterTime)}</span>
                </div>
                {outputRate && (
                  <div>
                    <span className="text-gray-500">出品率: </span>
                    <span className="text-forest-600 font-medium">{outputRate}%</span>
                  </div>
                )}
                {batch.outputAmountMl !== undefined && (
                  <div>
                    <span className="text-gray-500">出品量: </span>
                    <span className="text-gray-800">{batch.outputAmountMl}ml</span>
                  </div>
                )}
                {batch.tasteRating !== undefined && (
                  <div>
                    <span className="text-gray-500">口感: </span>
                    <span className="text-amber-500">{'★'.repeat(batch.tasteRating)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {batch.lossReason && batch.lossAmountMl !== undefined && (
            <div className="bg-coral-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-coral-600 text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                损耗记录
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">损耗量: </span>
                  <span className="text-coral-600 font-medium">{batch.lossAmountMl}ml</span>
                </div>
                <div>
                  <span className="text-gray-500">原因: </span>
                  <span className="text-gray-800">{batch.lossReason}</span>
                </div>
              </div>
            </div>
          )}
          
          {batch.offShelfReason && (
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                <X className="w-4 h-4" />
                下架信息
              </div>
              <div className="text-sm">
                <span className="text-gray-500">原因: </span>
                <span className="text-gray-800">{batch.offShelfReason}</span>
              </div>
              {batch.offShelfTime && (
                <div className="text-sm mt-1">
                  <span className="text-gray-500">时间: </span>
                  <span className="text-gray-800">{formatDateTime(batch.offShelfTime)}</span>
                </div>
              )}
            </div>
          )}
          
          {batch.photoUrl && (
            <div>
              <p className="text-sm text-gray-500 mb-2">批次照片</p>
              <img 
                src={batch.photoUrl} 
                alt="批次照片" 
                className="w-full rounded-xl object-cover max-h-48"
              />
            </div>
          )}
          
          <div className="pt-2 flex gap-3">
            {batch.status !== 'filtered' && batch.status !== 'off_shelf' && (
              <button
                onClick={onFilter}
                className="flex-1 py-3 rounded-xl text-white bg-matcha-500 hover:bg-matcha-600 transition-colors font-medium shadow-md shadow-matcha-200"
              >
                记录过滤
              </button>
            )}
            {batch.status === 'filtered' && (
              <button
                onClick={onOffShelf}
                className="flex-1 py-3 rounded-xl text-white bg-coral-500 hover:bg-coral-600 transition-colors font-medium shadow-md shadow-coral-200"
              >
                手动下架
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
