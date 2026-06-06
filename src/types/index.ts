export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type CardType = 'major' | 'minor';

export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  type: CardType;
  suit?: Suit;
  number?: number;
  image: string;
  meaning: {
    upright: string;
    reversed: string;
  };
  keywords: {
    upright: string[];
    reversed: string[];
  };
}

export interface Position {
  index: number;
  name: string;
  meaning: string;
}

export interface Spread {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  positions: Position[];
  icon: string;
}

export interface DrawnCard {
  card: TarotCard;
  position: Position;
  isReversed: boolean;
}

export interface ReadingRecord {
  id: string;
  timestamp: number;
  spreadId: string;
  spreadName: string;
  question: string;
  cards: DrawnCard[];
  interpretation: string;
}

export type Theme = 'dark' | 'light';
