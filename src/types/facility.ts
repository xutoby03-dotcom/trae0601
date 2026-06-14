export type FacilityStatus = 'active' | 'inactive' | 'maintenance';

export interface Facility {
  id: string;
  name: string;
  location: string;
  age_range: string;
  install_date: string;
  inspection_cycle_days: number;
  responsible_person: string;
  responsible_phone: string;
  photo_url: string;
  status: FacilityStatus;
  last_inspection_date: string;
  created_at: string;
  updated_at: string;
}

export const FACILITY_STATUS_CONFIG = {
  active: { label: '使用中', color: '#2A9D8F' },
  inactive: { label: '已停用', color: '#E63946' },
  maintenance: { label: '维修中', color: '#FF6B35' },
};
