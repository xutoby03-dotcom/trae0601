import { create } from 'zustand';
import type { Answer, TestResult } from '@/types';
import { questions } from '@/data/questions';
import { calculateResult } from '@/utils/calculateResult';
import { loadHistory, saveHistory, clearHistory } from '@/utils/storage';

interface TestState {
  currentQuestion: number;
  answers: Answer[];
  result: TestResult | null;
  history: TestResult[];
  isTestStarted: boolean;
  
  startTest: () => void;
  selectAnswer: (questionId: number, optionIndex: number, intensity: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitTest: () => void;
  saveToHistory: () => void;
  loadHistoryFromStorage: () => void;
  clearHistoryData: () => void;
  deleteHistoryItem: (id: string) => void;
  resetTest: () => void;
  setResult: (result: TestResult) => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  currentQuestion: 0,
  answers: [],
  result: null,
  history: [],
  isTestStarted: false,

  startTest: () => {
    set({
      currentQuestion: 0,
      answers: [],
      result: null,
      isTestStarted: true,
    });
  },

  selectAnswer: (questionId: number, optionIndex: number, intensity: number) => {
    set((state) => {
      const existingIndex = state.answers.findIndex((a) => a.questionId === questionId);
      const newAnswer: Answer = { questionId, selectedOption: optionIndex, intensity };
      
      if (existingIndex >= 0) {
        const newAnswers = [...state.answers];
        newAnswers[existingIndex] = newAnswer;
        return { answers: newAnswers };
      } else {
        return { answers: [...state.answers, newAnswer] };
      }
    });
  },

  nextQuestion: () => {
    set((state) => ({
      currentQuestion: Math.min(state.currentQuestion + 1, questions.length - 1),
    }));
  },

  prevQuestion: () => {
    set((state) => ({
      currentQuestion: Math.max(state.currentQuestion - 1, 0),
    }));
  },

  submitTest: () => {
    const { answers } = get();
    const result = calculateResult(answers);
    set({ result });
    // 自动保存到历史记录
    const { history } = get();
    const exists = history.some((h) => h.id === result.id);
    if (!exists) {
      const newHistory = [result, ...history];
      set({ history: newHistory });
      saveHistory(newHistory);
    }
  },

  saveToHistory: () => {
    const { result, history } = get();
    if (result) {
      const exists = history.some((h) => h.id === result.id);
      if (!exists) {
        const newHistory = [result, ...history];
        set({ history: newHistory });
        saveHistory(newHistory);
      }
    }
  },

  loadHistoryFromStorage: () => {
    const history = loadHistory();
    set({ history });
  },

  clearHistoryData: () => {
    clearHistory();
    set({ history: [] });
  },

  deleteHistoryItem: (id: string) => {
    const { history } = get();
    const newHistory = history.filter((h) => h.id !== id);
    set({ history: newHistory });
    saveHistory(newHistory);
  },

  resetTest: () => {
    set({
      currentQuestion: 0,
      answers: [],
      result: null,
      isTestStarted: false,
    });
  },

  setResult: (result: TestResult) => {
    set({ result });
  },
}));
