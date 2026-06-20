import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon, Upload, ZoomIn, ZoomOut, Move,
  Grid3X3, ArrowLeftRight, FileText, Trash2, Maximize2
} from 'lucide-react';
import { useInspectionStore } from '@/store/useInspectionStore';
import { APERTURES } from '@/data/checklistItems';
import { SampleType } from '@/types';
import { formatPrice } from '@/utils/evaluation';

const SAMPLE_TYPES: { type: SampleType; label: string; pos: { x: number; y: number } }[] = [
  { type: 'center', label: '中心', pos: { x: 50, y: 50 } },
  { type: 'corner_tl', label: '左上角', pos: { x: 10, y: 10 } },
  { type: 'corner_tr', label: '右上角', pos: { x: 90, y: 10 } },
  { type: 'corner_bl', label: '左下角', pos: { x: 10, y: 90 } },
  { type: 'corner_br', label: '右下角', pos: { x: 90, y: 90 } },
  { type: 'vignetting', label: '暗角', pos: { x: 50, y: 90 } },
];

export default function SamplesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInspection, addSamplePhoto, removeSamplePhoto } = useInspectionStore();
  const inspection = getInspection(id || '');

  const [selectedAperture, setSelectedAperture] = useState(APERTURES[0]);
  const [compareMode, setCompareMode] = useState<'single' | 'grid'>('single');
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<SampleType>('center');
  const [compareApertures, setCompareApertures] = useState<string[]>([APERTURES[0], APERTURES[2]]);
  const imgRef = useRef<HTMLDivElement>(null);

  if (!inspection) {
    return (
      <div className="container py-20 text-center">
        <p className="text-gray-400">检测记录不存在</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">返回首页</button>
      </div>
    );
  }

  const getPhoto = (aperture: string, type: SampleType) => {
    return inspection.samplePhotos.find(p => p.aperture === aperture && p.type === type);
  };

  const currentPhoto = getPhoto(selectedAperture, selectedType);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, aperture: string, type: SampleType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addSamplePhoto(inspection.id, {
        aperture,
        type,
        imageData: reader.result as string,
        orderIndex: 0,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom(z => Math.max(1, Math.min(5, z + delta)));
  };

  useEffect(() => {
    const sample = SAMPLE_TYPES.find(s => s.type === selectedType);
    if (sample) setPosition(sample.pos);
  }, [selectedType]);

  const ImageViewer = ({ aperture, type, showControls = true }: { aperture: string; type: SampleType; showControls?: boolean }) => {
    const photo = getPhoto(aperture, type);
    const typeInfo = SAMPLE_TYPES.find(s => s.type === type);

    if (!photo) {
      return (
        <label className="relative aspect-[4/3] rounded-xl bg-ink-800/50 border-2 border-dashed border-ink-700 hover:border-copper-500/40 cursor-pointer flex flex-col items-center justify-center group transition-all overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-copper-500/0 via-copper-500/0 to-copper-500/5 group-hover:from-copper-500/10 transition-all" />
          <Upload className="w-8 h-8 text-gray-600 group-hover:text-copper-400 transition-colors mb-2" />
          <p className="text-sm text-gray-500 group-hover:text-gray-300">{typeInfo?.label}</p>
          <p className="text-xs text-gray-600 mt-0.5">{aperture}</p>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, aperture, type)} />
        </label>
      );
    }

    return (
      <div className="relative rounded-xl overflow-hidden bg-ink-950 border border-ink-700 group">
        <div
          ref={showControls ? imgRef : undefined}
          className={`aspect-[4/3] overflow-hidden ${showControls && zoom > 1 ? 'cursor-' + (isDragging ? 'grabbing' : 'grab') : ''}`}
          onMouseDown={showControls ? handleMouseDown : undefined}
          onMouseMove={showControls ? handleMouseMove : undefined}
          onMouseUp={showControls ? handleMouseUp : undefined}
          onMouseLeave={showControls ? handleMouseUp : undefined}
          onWheel={showControls ? handleWheel : undefined}
        >
          <img
            src={photo.imageData}
            alt={`${aperture} ${typeInfo?.label}`}
            className="w-full h-full object-cover transition-transform duration-100 select-none"
            style={{
              transform: showControls
                ? `scale(${zoom}) translate(${(50 - position.x) * (zoom - 1) / zoom * 2}%, ${(50 - position.y) * (zoom - 1) / zoom * 2}%)`
                : undefined,
              transformOrigin: `${position.x}% ${position.y}%`,
            }}
            draggable={false}
          />
        </div>
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="px-2 py-1 rounded-md bg-ink-950/80 backdrop-blur-sm text-[11px] text-copper-400 font-medium border border-ink-700/50">
            {aperture}
          </span>
          <span className="px-2 py-1 rounded-md bg-ink-950/80 backdrop-blur-sm text-[11px] text-gray-300 border border-ink-700/50">
            {typeInfo?.label}
          </span>
        </div>
        {showControls && (
          <button
            onClick={() => removeSamplePhoto(inspection.id, photo.id)}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-ink-950/80 backdrop-blur-sm text-gray-400 hover:text-rust-400 border border-ink-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-10">
      <div className="container pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">样张对比分析</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span className="text-copper-400">{inspection.lensInfo.brand} {inspection.lensInfo.model}</span>
              <span>·</span>
              <span>报价 {formatPrice(inspection.lensInfo.sellerPrice)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/inspection/${inspection.id}`)}
              className="btn-secondary"
            >
              <ArrowLeftRight className="w-4 h-4 rotate-180" />
              返回检查
            </button>
            <button
              onClick={() => navigate(`/inspection/${inspection.id}/report`)}
              className="btn-primary"
            >
              <FileText className="w-4 h-4" />
              生成报告
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-ink-800/50 border border-ink-700">
            <button
              onClick={() => setCompareMode('single')}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all
                ${compareMode === 'single' ? 'bg-copper-500 text-ink-950 font-medium' : 'text-gray-400 hover:text-white'}`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              单图查看
            </button>
            <button
              onClick={() => setCompareMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all
                ${compareMode === 'grid' ? 'bg-copper-500 text-ink-950 font-medium' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              对比查看
            </button>
          </div>
        </div>

        {compareMode === 'single' ? (
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500 mr-1">光圈：</span>
                {APERTURES.map(ap => (
                  <button
                    key={ap}
                    onClick={() => setSelectedAperture(ap)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all
                      ${selectedAperture === ap
                        ? 'bg-copper-500/20 text-copper-400 border border-copper-500/40'
                        : 'bg-ink-800 text-gray-400 border border-ink-700 hover:border-ink-600'}`}
                  >
                    {ap}
                  </button>
                ))}
              </div>
              <ImageViewer aperture={selectedAperture} type={selectedType} />
              {currentPhoto && (
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="btn-secondary !px-3 !py-2" disabled={zoom <= 1}>
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-800 border border-ink-700">
                    <Move className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-300">{Math.round(zoom * 100)}%</span>
                  </div>
                  <button onClick={() => setZoom(z => Math.min(5, z + 0.5))} className="btn-secondary !px-3 !py-2" disabled={zoom >= 5}>
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setZoom(1); setPosition({ x: 50, y: 50 }); }} className="btn-secondary !px-3 !py-2 ml-2">
                    重置
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
                  <Grid3X3 className="w-4 h-4 text-copper-400" />
                  选择区域
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {SAMPLE_TYPES.map(st => {
                    const hasPhoto = !!getPhoto(selectedAperture, st.type);
                    return (
                      <button
                        key={st.type}
                        onClick={() => setSelectedType(st.type)}
                        className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all
                          ${selectedType === st.type
                            ? 'bg-copper-500 text-ink-950 shadow-glow'
                            : hasPhoto
                              ? 'bg-ink-800 text-gray-300 border border-ink-600 hover:border-copper-500/40'
                              : 'bg-ink-800/50 text-gray-600 border border-dashed border-ink-700'
                          }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white mb-3">所有样张</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                  {APERTURES.map(ap => {
                    const count = inspection.samplePhotos.filter(p => p.aperture === ap).length;
                    return (
                      <div key={ap} className="flex items-center justify-between py-1.5 border-b border-ink-800 last:border-0">
                        <span className="text-sm text-gray-400">{ap}</span>
                        <span className={`text-xs ${count > 0 ? 'text-jade-400' : 'text-gray-600'}`}>
                          {count} / 6 张
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white mb-3">查看提示</h3>
                <ul className="text-xs text-gray-400 space-y-1.5 leading-relaxed">
                  <li>• 滚轮滑动可快速缩放</li>
                  <li>• 放大后可拖拽移动查看</li>
                  <li>• 点击不同区域快速切换</li>
                  <li>• 重点对比边角分辨率差异</li>
                  <li>• 注意全开光圈的暗角情况</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-500">对比光圈：</span>
              {[0, 1].map(idx => (
                <select
                  key={idx}
                  className="input !py-2 !text-sm !w-auto"
                  value={compareApertures[idx]}
                  onChange={(e) => {
                    const newArr = [...compareApertures];
                    newArr[idx] = e.target.value;
                    setCompareApertures(newArr);
                  }}
                >
                  {APERTURES.map(ap => <option key={ap} value={ap}>{ap}</option>)}
                </select>
              ))}
              <button
                onClick={() => setCompareApertures([APERTURES[0], APERTURES[2]])}
                className="text-xs text-copper-400 hover:underline"
              >
                重置
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {compareApertures.map((ap, apIdx) => (
                <div key={apIdx} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-6 rounded-full ${apIdx === 0 ? 'bg-copper-500' : 'bg-jade-500'}`} />
                    <h3 className="font-display text-lg font-semibold text-white">{ap}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(['center', 'corner_tl', 'corner_br', 'vignetting'] as SampleType[]).map(type => (
                      <ImageViewer key={type} aperture={ap} type={type} showControls={false} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-6 gap-3 pt-4">
              {SAMPLE_TYPES.map(st => (
                <div key={st.type} className="space-y-2">
                  <p className="text-xs text-center text-gray-500">{st.label}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {compareApertures.map(ap => {
                      const photo = getPhoto(ap, st.type);
                      if (!photo) {
                        return (
                          <div key={ap} className="aspect-square rounded bg-ink-800/50 border border-dashed border-ink-700" />
                        );
                      }
                      return (
                        <div
                          key={ap}
                          className="aspect-square rounded overflow-hidden border border-ink-700 cursor-pointer hover:border-copper-500/40 transition-all group"
                          onClick={() => { setCompareMode('single'); setSelectedAperture(ap); setSelectedType(st.type); }}
                        >
                          <img src={photo.imageData} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
