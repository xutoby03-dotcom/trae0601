export interface Book {
  id: string;
  name: string;
  dynasty: string;
  bookNumber: string;
  description?: string;
}

export type PhotoState = 'wet' | 'half_dry' | 'full_dry';

export interface Photo {
  id: string;
  trialId: string;
  state: PhotoState;
  dataUrl: string;
  fileName: string;
  size: number;
}

export interface Evaluation {
  id: string;
  trialId: string;
  colorDifference: number;
  edgeWarping: number;
  gluePenetration: number;
  touchDifference: number;
  remarks?: string;
}

export type FiberDirection = 'vertical' | 'horizontal' | 'diagonal';

export interface Trial {
  id: string;
  bookId: string;
  version: number;
  paperThickness: number;
  fiberDirection: FiberDirection;
  dyeRatio: string;
  pasteConcentration: number;
  photos: Photo[];
  evaluation: Evaluation;
  createdAt: string;
  isSelected: boolean;
}

export interface AppState {
  currentBook: Book;
  trials: Trial[];
  currentTrialId: string | null;
}

export interface AppActions {
  setCurrentTrial: (trialId: string | null) => void;
  createNewTrial: () => Trial;
  updateTrial: (trialId: string, updates: Partial<Trial>) => void;
  updateEvaluation: (trialId: string, updates: Partial<Evaluation>) => void;
  updatePhoto: (trialId: string, photo: Photo) => void;
  selectTrial: (trialId: string) => void;
  saveToStorage: () => void;
  resetToMock: () => void;
}

export const photoStateLabels: Record<PhotoState, string> = {
  wet: '湿态',
  half_dry: '半干',
  full_dry: '全干',
};

export const fiberDirectionLabels: Record<FiberDirection, string> = {
  vertical: '纵向',
  horizontal: '横向',
  diagonal: '斜向',
};

export const evaluationLabels = {
  colorDifference: '色差',
  edgeWarping: '翘边',
  gluePenetration: '透胶',
  touchDifference: '触感差异',
};

export const scoreDescriptions: Record<number, string> = {
  1: '极接近',
  2: '接近',
  3: '一般',
  4: '较差',
  5: '明显差异',
};
