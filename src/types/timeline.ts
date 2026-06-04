export type TrackType = 'video' | 'audio' | 'subtitle';

export interface Track {
  id: string;
  projectId: string;
  type: TrackType;
  index: number;
  name: string;
  muted: boolean;
  locked: boolean;
}

export type TransitionType = 'fade' | 'dissolve' | 'push' | 'slide';
export type FilterType = 'none' | 'grayscale' | 'sepia' | 'blur';

export interface VolumeKeyframe {
  time: number;
  value: number;
}

export interface Clip {
  id: string;
  trackId: string;
  mediaItemId: string;
  start: number;
  end: number;
  offset: number;
  transform: {
    scale: number;
    rotation: number;
    positionX: number;
    positionY: number;
  };
  opacity: number;
  speed: number;
  reverse: boolean;
  color: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
  filter: FilterType;
  transition?: {
    type: TransitionType;
    duration: number;
  };
  volume?: number;
  volumeKeyframes?: VolumeKeyframe[];
}

export interface SubtitleClip extends Omit<Clip, 'mediaItemId'> {
  text: string;
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    strokeColor?: string;
    strokeWidth?: number;
    shadow?: boolean;
  };
}
