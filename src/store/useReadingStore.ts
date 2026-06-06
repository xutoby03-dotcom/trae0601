import { create } from 'zustand';
import { TarotCard, Spread, DrawnCard, ReadingRecord } from '@/types';
import { tarotCards, shuffleCards } from '@/data/tarotCards';
import { getSpreadById } from '@/data/spreads';
import { saveRecord, getRecords } from '@/utils/storage';

interface ReadingState {
  currentSpread: Spread | null;
  question: string;
  shuffledDeck: TarotCard[];
  drawnCards: DrawnCard[];
  isComplete: boolean;
  history: ReadingRecord[];
  setSpread: (spreadId: string) => void;
  setQuestion: (question: string) => void;
  startReading: () => void;
  drawCard: (cardIndex: number) => boolean;
  generateInterpretation: () => string;
  saveToHistory: () => void;
  loadHistory: () => void;
  resetReading: () => void;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  currentSpread: null,
  question: '',
  shuffledDeck: [],
  drawnCards: [],
  isComplete: false,
  history: [],

  setSpread: (spreadId: string) => {
    const spread = getSpreadById(spreadId);
    set({ currentSpread: spread });
  },

  setQuestion: (question: string) => {
    set({ question });
  },

  startReading: () => {
    const shuffled = shuffleCards(tarotCards);
    set({
      shuffledDeck: shuffled,
      drawnCards: [],
      isComplete: false
    });
  },

  drawCard: (cardIndex: number): boolean => {
    const { currentSpread, shuffledDeck, drawnCards } = get();
    if (!currentSpread) return false;
    if (drawnCards.length >= currentSpread.cardCount) return false;
    if (cardIndex < 0 || cardIndex >= shuffledDeck.length) return false;

    const card = shuffledDeck[cardIndex];
    const position = currentSpread.positions[drawnCards.length];
    const isReversed = Math.random() > 0.5;

    const newDrawnCard: DrawnCard = {
      card,
      position,
      isReversed
    };

    const newDrawnCards = [...drawnCards, newDrawnCard];
    const newDeck = shuffledDeck.filter((_, i) => i !== cardIndex);
    const isComplete = newDrawnCards.length >= currentSpread.cardCount;

    set({
      drawnCards: newDrawnCards,
      shuffledDeck: newDeck,
      isComplete
    });

    return isComplete;
  },

  generateInterpretation: (): string => {
    const { drawnCards, question, currentSpread } = get();
    if (!currentSpread) return '';

    let interpretation = `关于你的问题"${question}"，以下是${currentSpread.name}的解读：\n\n`;

    drawnCards.forEach((dc) => {
      const cardMeaning = dc.isReversed ? dc.card.meaning.reversed : dc.card.meaning.upright;
      const keywords = dc.isReversed ? dc.card.keywords.reversed : dc.card.keywords.upright;
      interpretation += `【${dc.position.name}】- ${dc.card.name}${dc.isReversed ? '（逆位）' : '（正位）'}\n`;
      interpretation += `位置含义：${dc.position.meaning}\n`;
      interpretation += `牌意：${cardMeaning}\n`;
      interpretation += `关键词：${keywords.join('、')}\n\n`;
    });

    interpretation += '【综合解读】\n';
    interpretation += '综合来看，这些牌的组合显示：\n';
    interpretation += '这是一个需要你深入思考和觉察的时期。每张牌都在告诉你故事的不同侧面，';
    interpretation += '请相信你的直觉，倾听内心的声音。牌面所展示的只是可能性，最终的选择权始终在你手中。';

    return interpretation;
  },

  saveToHistory: () => {
    const { currentSpread, question, drawnCards, generateInterpretation } = get();
    if (!currentSpread || drawnCards.length === 0) return;

    const record: ReadingRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      spreadId: currentSpread.id,
      spreadName: currentSpread.name,
      question,
      cards: drawnCards,
      interpretation: generateInterpretation()
    };

    saveRecord(record);
    get().loadHistory();
  },

  loadHistory: () => {
    const records = getRecords();
    set({ history: records });
  },

  resetReading: () => {
    set({
      question: '',
      shuffledDeck: [],
      drawnCards: [],
      isComplete: false
    });
  }
}));
