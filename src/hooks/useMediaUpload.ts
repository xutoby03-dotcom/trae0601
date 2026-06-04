import { useCallback } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import type { MediaItem } from '@/types/media';
import {
  getMediaType,
  createObjectURL,
  getVideoDuration,
  getVideoDimensions,
  getImageDimensions,
  generateThumbnail,
} from '@/utils/fileUtils';
import { generateId } from '@/utils/timecode';
import * as db from '@/utils/indexedDB';

export function useMediaUpload() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const addMediaItem = useTimelineStore((state) => state.addMediaItem);
  
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!currentProject) return;
      
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        const type = getMediaType(file.name);
        if (!type) continue;
        
        const url = createObjectURL(file);
        let duration = 0;
        let width: number | undefined;
        let height: number | undefined;
        
        try {
          if (type === 'video') {
            duration = await getVideoDuration(url);
            const dims = await getVideoDimensions(url);
            width = dims.width;
            height = dims.height;
          } else if (type === 'image') {
            const dims = await getImageDimensions(url);
            width = dims.width;
            height = dims.height;
            duration = 5;
          } else if (type === 'audio') {
            duration = await getVideoDuration(url);
          }
          
          const thumbnail = await generateThumbnail(url, type);
          
          const mediaItem: MediaItem = {
            id: generateId(),
            projectId: currentProject.id,
            name: file.name,
            type,
            url,
            duration,
            width,
            height,
            size: file.size,
            thumbnail,
          };
          
          addMediaItem(mediaItem);
          await db.saveMediaItem(mediaItem);
        } catch (error) {
          console.error('Error processing file:', file.name, error);
        }
      }
    },
    [currentProject, addMediaItem]
  );
  
  return { handleFiles };
}
