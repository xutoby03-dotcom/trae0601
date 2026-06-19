export type VoicePart = '女高音' | '女低音' | '男高音' | '男低音' | '混声';

export type BindingStatus = '已装订' | '未装订' | '半装订';

export type ScoreStatus = '正常' | '破损' | '待重印';

export type BorrowStatus = '借阅中' | '已归还' | '逾期';

export interface Score {
  id: string;
  name: string;
  voice_part: VoicePart;
  version: string;
  pages: number;
  binding_status: BindingStatus;
  total_stock: number;
  available_stock: number;
  photo_url?: string;
  status: ScoreStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  name: string;
  voice_part: VoicePart;
  phone: string;
  needs_large_print: boolean;
  attendance_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BorrowRecord {
  id: string;
  score_id: string;
  member_id: string;
  rehearsal_date: string;
  expected_return_date: string;
  with_pencil_mark: boolean;
  status: BorrowStatus;
  has_missing_pages: boolean;
  has_damage: boolean;
  has_writing: boolean;
  needs_reprint: boolean;
  return_notes?: string;
  actual_return_date?: string;
  created_at: string;
}
