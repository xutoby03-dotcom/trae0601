export type Dimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export type MBIType = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export interface QuestionOption {
  text: string;
  dimension: Dimension;
  weight: number;
}

export interface Question {
  id: number;
  scenario: string;
  options: QuestionOption[];
}

export interface Answer {
  questionId: number;
  selectedOption: number;
  intensity: number;
}

export interface TestResult {
  id: string;
  timestamp: number;
  type: MBIType;
  scores: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
  percentages: {
    EI: number;
    SN: number;
    TF: number;
    JP: number;
  };
}

export interface TypeDetail {
  type: MBIType;
  name: string;
  nickname: string;
  description: string;
  color: string;
  traits: string[];
  careers: string[];
  celebrities: { name: string; role: string }[];
  compatibility: {
    best: MBIType[];
    good: MBIType[];
    challenge: MBIType[];
  };
}
