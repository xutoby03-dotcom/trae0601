import { Images } from 'lucide-react';
import { Trial, Photo, PhotoState } from '@/types';
import PhotoUploader from './PhotoUploader';

interface PhotoCompareProps {
  trial: Trial;
  onPhotoUpdate: (trialId: string, photo: Photo) => void;
}

const photoStates: PhotoState[] = ['wet', 'half_dry', 'full_dry'];

export default function PhotoCompare({ trial, onPhotoUpdate }: PhotoCompareProps) {
  const getPhotoByState = (state: PhotoState): Photo | undefined => {
    return trial.photos.find(p => p.state === state);
  };

  const handleUpload = (photo: Photo) => {
    onPhotoUpdate(trial.id, photo);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Images className="w-5 h-5 text-ochre-600" />
        <h3 className="text-lg font-semibold text-ink-900">三态对比</h3>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {photoStates.map((state) => (
          <div key={state} className="flex-1">
            <PhotoUploader
              trialId={trial.id}
              state={state}
              photo={getPhotoByState(state)}
              onUpload={handleUpload}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
