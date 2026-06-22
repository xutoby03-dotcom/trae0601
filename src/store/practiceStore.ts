import { create } from 'zustand';
import type {
  Course,
  SignWord,
  Student,
  PracticeRecord,
  Annotation,
  DimensionScore,
  ErrorType,
  ToolType,
  ScoreDimension,
} from '../types';
import { mockCourses, mockSignWords, mockStudents, mockPracticeRecords } from '../data/mockData';
import {
  generateId,
  calculateOverallScore,
  determineNeedsReview,
  storage,
} from '../utils';

interface PracticeState {
  courses: Course[];
  signWords: SignWord[];
  students: Student[];
  practiceRecords: PracticeRecord[];

  currentCourseId: string;
  currentStudentId: string;
  currentSignWordId: string | null;
  currentRecordId: string | null;

  annotations: Annotation[];
  scores: DimensionScore;
  videoUrl: string;
  videoName: string;

  currentTool: ToolType;
  currentColor: string;
  currentErrorType: ErrorType;
  selectedAnnotationId: string | null;

  videoCurrentTime: number;
  videoDuration: number;
  isPlaying: boolean;
  playbackRate: number;
  videoFps: number;

  setCurrentCourse: (id: string) => void;
  setCurrentStudent: (id: string) => void;
  setCurrentSignWord: (id: string | null) => void;

  addCourse: (name: string, description: string) => void;
  addSignWord: (
    courseId: string,
    name: string,
    standardPoints: SignWord['standardPoints']
  ) => void;
  updateSignWord: (id: string, updates: Partial<SignWord>) => void;
  deleteSignWord: (id: string) => void;

  setVideo: (url: string, name: string) => void;
  setVideoTime: (time: number) => void;
  setVideoDuration: (duration: number) => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;

  setTool: (tool: ToolType) => void;
  setColor: (color: string) => void;
  setErrorType: (type: ErrorType) => void;

  addAnnotation: (annotation: Omit<Annotation, 'id'>) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  setSelectedAnnotation: (id: string | null) => void;

  setScore: (dimension: ScoreDimension, score: number) => void;
  setComment: (dimension: ScoreDimension, comment: string) => void;

  saveCurrentRecord: () => void;
  loadRecord: (recordId: string) => void;
  resetCurrentSession: () => void;
  toggleRecordReview: (recordId: string) => void;
  deleteRecord: (recordId: string) => void;

  activeLeftPanel: 'words' | 'review';
  setActiveLeftPanel: (panel: 'words' | 'review') => void;

  activeRightPanel: 'score' | 'tools' | 'annotations';
  setActiveRightPanel: (panel: 'score' | 'tools' | 'annotations') => void;

  annotationScrollToId: string | null;
  clearAnnotationScrollToId: () => void;
}

const defaultScores: DimensionScore = {
  handShape: 80,
  orientation: 80,
  trajectory: 80,
  expression: 80,
  comments: {
    handShape: '',
    orientation: '',
    trajectory: '',
    expression: '',
  },
};

export const usePracticeStore = create<PracticeState>((set, get) => ({
  courses: storage.get('sign-courses', mockCourses),
  signWords: storage.get('sign-words', mockSignWords),
  students: storage.get('sign-students', mockStudents),
  practiceRecords: storage.get('sign-records', mockPracticeRecords),

  currentCourseId: mockCourses[0]?.id || '',
  currentStudentId: mockStudents[0]?.id || '',
  currentSignWordId: null,
  currentRecordId: null,

  annotations: [],
  scores: { ...defaultScores, comments: { ...defaultScores.comments } },
  videoUrl: '',
  videoName: '',

  currentTool: 'select',
  currentColor: '#ff4757',
  currentErrorType: 'handShape',
  selectedAnnotationId: null,

  activeLeftPanel: 'words' as const,
  activeRightPanel: 'score' as const,
  annotationScrollToId: null as string | null,

  videoCurrentTime: 0,
  videoDuration: 0,
  isPlaying: false,
  playbackRate: 1,
  videoFps: 30,

  setCurrentCourse: (id) => set({ currentCourseId: id, currentSignWordId: null }),
  setCurrentStudent: (id) => set({ currentStudentId: id }),
  setCurrentSignWord: (id) => set({ currentSignWordId: id }),

  addCourse: (name, description) => {
    const newCourse: Course = {
      id: generateId(),
      name,
      description,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const courses = [...get().courses, newCourse];
    set({ courses });
    storage.set('sign-courses', courses);
  },

  addSignWord: (courseId, name, standardPoints) => {
    const newWord: SignWord = {
      id: generateId(),
      courseId,
      name,
      standardPoints,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const signWords = [...get().signWords, newWord];
    set({ signWords });
    storage.set('sign-words', signWords);
  },

  updateSignWord: (id, updates) => {
    const signWords = get().signWords.map((w) =>
      w.id === id ? { ...w, ...updates } : w
    );
    set({ signWords });
    storage.set('sign-words', signWords);
  },

  deleteSignWord: (id) => {
    const signWords = get().signWords.filter((w) => w.id !== id);
    set({ signWords, currentSignWordId: get().currentSignWordId === id ? null : get().currentSignWordId });
    storage.set('sign-words', signWords);
  },

  setVideo: (url, name) => set({ videoUrl: url, videoName: name }),
  setVideoTime: (time) => set({ videoCurrentTime: time }),
  setVideoDuration: (duration) => set({ videoDuration: duration }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),

  setTool: (tool) => set({ currentTool: tool, selectedAnnotationId: null }),
  setColor: (color) => set({ currentColor: color }),
  setErrorType: (type) => set({ currentErrorType: type }),
  setActiveLeftPanel: (panel) => set({ activeLeftPanel: panel }),
  setActiveRightPanel: (panel) => set({ activeRightPanel: panel }),
  clearAnnotationScrollToId: () => set({ annotationScrollToId: null }),

  addAnnotation: (annotation) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: generateId(),
    };
    set({ annotations: [...get().annotations, newAnnotation] });
  },

  updateAnnotation: (id, updates) => {
    set({
      annotations: get().annotations.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    });
  },

  deleteAnnotation: (id) => {
    set({
      annotations: get().annotations.filter((a) => a.id !== id),
      selectedAnnotationId: get().selectedAnnotationId === id ? null : get().selectedAnnotationId,
    });
  },

  setSelectedAnnotation: (id) => set({ selectedAnnotationId: id }),

  setScore: (dimension, score) => {
    set({
      scores: {
        ...get().scores,
        [dimension]: score,
      },
    });
  },

  setComment: (dimension, comment) => {
    set({
      scores: {
        ...get().scores,
        comments: {
          ...get().scores.comments,
          [dimension]: comment,
        },
      },
    });
  },

  saveCurrentRecord: () => {
    const state = get();
    if (!state.currentSignWordId) return;

    const overallScore = calculateOverallScore(state.scores);
    const needsReview = determineNeedsReview(overallScore, state.scores);

    if (state.currentRecordId) {
      const practiceRecords = state.practiceRecords.map((r) =>
        r.id === state.currentRecordId
          ? {
              ...r,
              scores: state.scores,
              annotations: state.annotations,
              overallScore,
              needsReview,
            }
          : r
      );
      set({ practiceRecords });
      storage.set('sign-records', practiceRecords);
    } else {
      const newRecord: PracticeRecord = {
        id: generateId(),
        studentId: state.currentStudentId,
        signWordId: state.currentSignWordId,
        courseId: state.currentCourseId,
        videoUrl: state.videoUrl,
        videoName: state.videoName,
        scores: state.scores,
        annotations: state.annotations,
        overallScore,
        practiceDate: new Date().toISOString().split('T')[0],
        needsReview,
      };
      const practiceRecords = [...state.practiceRecords, newRecord];
      set({ practiceRecords, currentRecordId: newRecord.id });
      storage.set('sign-records', practiceRecords);
    }
  },

  loadRecord: (recordId) => {
    const record = get().practiceRecords.find((r) => r.id === recordId);
    if (!record) return;

    const sortedAnnotations = [...record.annotations].sort((a, b) => a.timestamp - b.timestamp);
    const firstAnnotation = sortedAnnotations[0];
    const seekTime = firstAnnotation
      ? Math.max(0, firstAnnotation.timestamp - 0.3)
      : 0;

    set({
      currentRecordId: record.id,
      currentCourseId: record.courseId,
      currentStudentId: record.studentId,
      currentSignWordId: record.signWordId,
      annotations: [...record.annotations],
      scores: {
        ...record.scores,
        comments: { ...record.scores.comments },
      },
      videoUrl: record.videoUrl,
      videoName: record.videoName,
      activeLeftPanel: 'words',
      activeRightPanel: firstAnnotation ? 'annotations' : 'score',
      selectedAnnotationId: firstAnnotation?.id || null,
      annotationScrollToId: firstAnnotation?.id || null,
      videoCurrentTime: seekTime,
      isPlaying: false,
    });
  },

  resetCurrentSession: () => {
    set({
      currentSignWordId: null,
      currentRecordId: null,
      annotations: [],
      scores: { ...defaultScores, comments: { ...defaultScores.comments } },
      videoUrl: '',
      videoName: '',
      selectedAnnotationId: null,
      videoCurrentTime: 0,
    });
  },

  toggleRecordReview: (recordId) => {
    const practiceRecords = get().practiceRecords.map((r) =>
      r.id === recordId ? { ...r, needsReview: !r.needsReview } : r
    );
    set({ practiceRecords });
    storage.set('sign-records', practiceRecords);
  },

  deleteRecord: (recordId) => {
    const practiceRecords = get().practiceRecords.filter((r) => r.id !== recordId);
    set({
      practiceRecords,
      currentRecordId: get().currentRecordId === recordId ? null : get().currentRecordId,
    });
    storage.set('sign-records', practiceRecords);
  },
}));
