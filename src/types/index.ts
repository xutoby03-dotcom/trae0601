export interface Exam {
  id: string;
  subject: string;
  grade: string;
  roomNumber: string;
  invigilator: string;
  candidateCount: number;
  examTime: string;
  createdAt: string;
}

export interface InventoryBatch {
  id: string;
  batchNumber: string;
  pageCount: number;
  startNumber: string;
  endNumber: string;
  packer: string;
  totalQuantity: number;
  remainingQuantity: number;
  createdAt: string;
}

export interface Distribution {
  id: string;
  examId: string;
  batchId: string;
  roomNumber: string;
  quantity: number;
  teacher: string;
  sealPhotoUrl: string;
  distributedAt: string;
}

export interface Collection {
  id: string;
  distributionId: string;
  examId: string;
  usedCount: number;
  blankCount: number;
  missingCount: number;
  abnormalNote: string;
  isLocked: boolean;
  collectedAt: string;
}
