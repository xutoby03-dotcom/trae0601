export interface Trip {
  id: string;
  destination: string;
  departureTime: string;
  transport: string;
  accommodation: string;
  notes: string;
}

export interface Person {
  id: string;
  name: string;
  avatar: string;
  emergencyContact: string;
  notes: string;
}

export interface Document {
  id: string;
  personId: string;
  type: DocumentType;
  number: string;
  expiryDate: string;
  photoBackup: boolean;
  inLuggage: boolean;
  notes: string;
}

export type DocumentType =
  | '身份证'
  | '护照'
  | '港澳通行证'
  | '台湾通行证'
  | '签证'
  | '驾照'
  | '学生证'
  | '其他';

export const DOCUMENT_TYPES: DocumentType[] = [
  '身份证',
  '护照',
  '港澳通行证',
  '台湾通行证',
  '签证',
  '驾照',
  '学生证',
  '其他',
];

export type DocumentStatus = 'expired' | 'warning' | 'normal';

export type ConfirmStatus = 'confirmed' | 'pending';
