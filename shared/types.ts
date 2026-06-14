export type CostumeStatus = 'available' | 'borrowed' | 'pending' | 'washing';
export type WashStatus = 'clean' | 'dirty';
export type BorrowStatus = 'borrowed' | 'returned' | 'overdue';
export type AccessoryCategory = 'clothes' | 'headdress' | 'belt' | 'shoe_cover';

export interface AccessoryItem {
  id?: number;
  costume_id: string;
  name: string;
  quantity: number;
  category: AccessoryCategory;
}

export interface Costume {
  id: string;
  name: string;
  size: string;
  program: string;
  photo_url: string;
  wash_status: WashStatus;
  status: CostumeStatus;
  use_count: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  accessories?: AccessoryItem[];
}

export interface BorrowRecord {
  id?: number;
  costume_id: string;
  student_name: string;
  club_name: string;
  activity_name: string;
  borrow_date: string;
  expected_return_date: string;
  actual_return_date?: string;
  deposit: number;
  status: BorrowStatus;
  notes?: string;
  club_leader_name?: string;
  club_leader_contact?: string;
  reminder_sent?: boolean;
  reminder_at?: string;
  reminder_note?: string;
  created_at?: string;
  costume?: Costume;
}

export interface ReturnCheck {
  id?: number;
  borrow_record_id: number;
  clothes_ok: boolean;
  headdress_ok: boolean;
  belt_ok: boolean;
  shoe_cover_ok: boolean;
  clean_ok: boolean;
  has_stain: boolean;
  has_damage: boolean;
  issues?: string;
  can_stock: boolean;
  created_at?: string;
}

export interface Club {
  id?: number;
  name: string;
  leader_name?: string;
  contact?: string;
  created_at?: string;
}

export interface Student {
  id?: number;
  name: string;
  student_id?: string;
  club_name?: string;
  phone?: string;
  created_at?: string;
}

export interface StatisticsOverview {
  total_costumes: number;
  borrowed_count: number;
  washing_count: number;
  overdue_count: number;
  available_count: number;
}

export interface UsageStat {
  costume_id: string;
  costume_name: string;
  use_count: number;
}

export interface ClubRanking {
  club_name: string;
  borrow_count: number;
  overdue_count: number;
}

export interface MissingRateStat {
  total_returns: number;
  missing_returns: number;
  missing_rate: number;
}

export interface OverdueNotification {
  id: number;
  costume_id: string;
  costume_name: string;
  costume_size: string;
  costume_photo?: string;
  student_name: string;
  club_name: string;
  activity_name: string;
  expected_return_date: string;
  overdue_days: number;
  club_leader_name?: string;
  club_leader_contact?: string;
  reminder_sent?: boolean;
  reminder_at?: string;
  reminder_note?: string;
  deposit?: number;
}
