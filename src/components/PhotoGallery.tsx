import { useState, useMemo } from 'react';
import { ImagePlus, X, Trash2, Calendar } from 'lucide-react';
import type { Photo, Stage } from '@/types';
import { STAGE_NAMES } from '@/types';
import { formatDateTime } from '@/utils/time';
import { compressImage } from '@/utils/image';

interface PhotoGalleryProps {
  photos: Photo[];
  stages: Stage[];
  stageFilter?: string;
  onAddPhoto?: (photo: Omit<Photo, 'id'>) => void;
  onDeletePhoto?: (id: string) => void;
  modelId: string;
  stageId: string;
}

export const PhotoGallery = ({ photos, stages, stageFilter, onAddPhoto, onDeletePhoto, modelId, stageId }: PhotoGalleryProps) => {
  const stageNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    stages.forEach((s) => {
      map[s.id] = STAGE_NAMES[s.name] || '其他';
    });
    return map;
  }, [stages]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredPhotos = stageFilter
    ? photos.filter((p) => p.stageId === stageFilter)
    : photos;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddPhoto) return;

    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      const caption = prompt('为照片添加说明文字:', '');
      
      onAddPhoto({
        modelId,
        stageId,
        data: compressed,
        caption: caption || '未命名',
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to process image:', error);
      alert('图片处理失败');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const groupedPhotos = filteredPhotos.reduce((acc, photo) => {
    const stageId = photo.stageId;
    if (!acc[stageId]) acc[stageId] = [];
    acc[stageId].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  return (
    <div className="bg-studio-card rounded-xl border border-studio-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-studio-text">照片档案</h3>
        {onAddPhoto && (
          <label className="flex items-center gap-2 px-4 py-2 bg-studio-cobalt hover:bg-studio-cobalt/80 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors">
            <ImagePlus className="w-4 h-4" />
            {isUploading ? '上传中...' : '添加照片'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-studio-border rounded-full flex items-center justify-center mx-auto mb-4">
            <ImagePlus className="w-8 h-8 text-studio-muted" />
          </div>
          <p className="text-studio-muted">暂无照片记录</p>
          <p className="text-sm text-studio-muted/70 mt-1">点击上方按钮添加第一张照片</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPhotos).map(([stageId, stagePhotos]) => (
            <div key={stageId}>
              <h4 className="text-sm font-medium text-studio-copper mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-studio-copper" />
                {stageNameMap[stageId] || '其他'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {stagePhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-studio-border cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.data}
                      alt={photo.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-xs text-white truncate">{photo.caption}</p>
                        <p className="text-xs text-white/70 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(photo.createdAt)}
                        </p>
                      </div>
                    </div>
                    {onDeletePhoto && (
                      <button
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-studio-rust rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定要删除这张照片吗？')) {
                            onDeletePhoto(photo.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-5xl max-h-[90vh] animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.data}
              alt={selectedPhoto.caption}
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center">
              <p className="text-white font-medium">{selectedPhoto.caption}</p>
              <p className="text-white/60 text-sm mt-1">
                {formatDateTime(selectedPhoto.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
