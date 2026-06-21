export type EnvironmentTag =
  | "forest"
  | "mountain"
  | "ocean"
  | "river"
  | "city"
  | "indoor"
  | "desert"
  | "wetland"
  | "village"
  | "cave";

export type EnvTag = EnvironmentTag;

export type WeatherCondition =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "foggy"
  | "windy"
  | "snowy"
  | "stormy";

export type Weather = WeatherCondition;

export type MicPolarPattern =
  | "cardioid"
  | "omnidirectional"
  | "figure8"
  | "shotgun"
  | "xy";

export type MicDirection = MicPolarPattern;
export type MicPattern = MicPolarPattern;

export type DistanceSense = "close" | "medium" | "far" | "distant";
export type Distance = "near" | "medium" | "far" | "extreme";

export type AnnotationType =
  | "loop"
  | "wind_noise"
  | "traffic"
  | "voice"
  | "needs_editing";

export type DeviceModel =
  | "Sony PCM-D100"
  | "Zoom F6"
  | "Tascam DR-44WL"
  | "Sound Devices MixPre-6 II"
  | "Sound Devices MixPre-10T"
  | "Zoom F8n Pro"
  | "Sennheiser MKH 8040";

export type LicenseType = "exclusive" | "non_exclusive";

export interface Annotation {
  id: string;
  type: AnnotationType;
  startTime: number;
  endTime: number;
  note?: string;
  content?: string;
  createdAt?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface LicenseInfo {
  projectId: string;
  projectName: string;
  licenseType: LicenseType;
  licensedAt: string;
  expiresAt?: string;
  notes?: string;
}

export interface RecordingLicense {
  licensed: boolean;
  projectId?: string;
  projectName?: string;
  type?: LicenseType;
  startedAt?: string;
  expiresAt?: string;
  note?: string;
}

export interface Recording {
  id: string;
  fileName: string;
  title: string;
  description?: string;
  notes?: string;
  duration: number;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  fileSize: number;
  format?: string;
  sampleFormat?: string;

  latitude: number;
  longitude: number;
  altitude: number;
  locationName: string;
  location: Location;
  envTags?: EnvironmentTag[];
  tags?: string[];

  recordedAt: string;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;

  weather: WeatherCondition;
  temperature: number;
  humidity: number;
  windSpeed: number;

  environmentTags: EnvironmentTag[];

  recorderModel: string;
  device?: DeviceModel;
  microphoneModel: string;
  polarPattern: MicPolarPattern;
  gainDb: number;

  ambienceScore: number;
  ambience?: number;
  distanceSense: DistanceSense;
  distance?: Distance;
  peakDbfs: number;
  peakDb?: number;
  rmsDbfs: number;
  dynamicRange: number;
  hasIssues: boolean;

  waveformData: number[];
  waveform: number[];

  annotations: Annotation[];

  isLocked: boolean;
  locked?: boolean;
  lockedByProjectId: string | null;
  lockedByProject?: string | null;
  licenseInfo: LicenseInfo | null;
  license?: RecordingLicense;
}

export interface FilterCriteria {
  search?: string;
  envTags?: EnvironmentTag[];
  weathers?: WeatherCondition[];
  devices?: DeviceModel[];
  micPatterns?: MicPolarPattern[];
  distances?: DistanceSense[];
  ambienceMin?: number;
  ambienceMax?: number;
  peakMin?: number;
  peakMax?: number;
  dateFrom?: string;
  dateTo?: string;
  onlyWithIssues?: boolean;
  onlyUnlocked?: boolean;
}

export interface FilterState {
  search: string;
  envTags: EnvironmentTag[];
  weathers: WeatherCondition[];
  devices: DeviceModel[];
  micPatterns: MicPolarPattern[];
  distances: DistanceSense[];
  ambienceMin: number;
  ambienceMax: number;
  peakMin: number;
  peakMax: number;
  dateFrom: string | null;
  dateTo: string | null;
  onlyWithIssues: boolean;
  onlyUnlocked: boolean;
  criteria: FilterCriteria;
  applied: FilterCriteria;
  tempFilter?: FilterCriteria;
}

export interface PlayerState {
  currentRecordingId: string | null;
  recordingId?: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  selection: { start: number; end: number } | null;
  hasSelection?: boolean;
}

export interface UIState {
  currentView?: string;
  selectedRecordingId: string | null;
  isDetailPanelOpen: boolean;
}

export type ViewMode = "grid" | "table";
export type SortKey =
  | "recordedAt"
  | "duration"
  | "locationName"
  | "ambienceScore"
  | "peakDbfs";
export type SortOrder = "asc" | "desc";

export interface ProjectLicense {
  isLicensed: boolean;
  type: LicenseType;
  startedAt: string;
  expiresAt: string | null;
  permanent: boolean;
  note?: string;
}

export type ProjectStatus = "active" | "planning" | "completed";

export interface LicenseEvent {
  id: string;
  projectId: string;
  recordingId?: string;
  title: string;
  date: string;
  description: string;
  tone: "success" | "info" | "warning" | "danger" | "pending";
  label: string;
  operator: string;
  licenseType?: LicenseType;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  clientName?: string;
  description: string;
  coverGradient: string;
  coverImage?: string;
  recordingIds: string[];
  usedRecordingCount: number;
  targetRecordingCount: number;
  status: ProjectStatus;
  license: ProjectLicense;
  licenseTimeline: LicenseEvent[];
  createdAt: string;
  updatedAt: string;
}
