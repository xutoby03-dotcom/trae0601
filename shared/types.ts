export interface Exhibition {
  id: number
  name: string
  venue: string
  start_date: string
  end_date: string
  booth_count: number
  open_time: string
  close_time: string
  setup_rules: string
  status: "draft" | "published" | "ongoing" | "ended"
  grid_rows: number
  grid_cols: number
  created_at: string
}

export type BoothType = "booth" | "aisle" | "empty"
export type BoothStatus = "available" | "applied" | "confirmed" | "conflict"

export interface Booth {
  id: number
  exhibition_id: number
  booth_number: string
  row: number
  col: number
  type: BoothType
  zone: string
  max_power_watts: number
  status: BoothStatus
  application?: Application
}

export type ApplicationStatus = "pending" | "approved" | "rejected"
export type ProductType =
  | "手工艺品"
  | "文创周边"
  | "食品饮料"
  | "服饰鞋帽"
  | "美妆个护"
  | "家居日用"
  | "数码配件"
  | "图书印刷"
  | "植物花卉"
  | "公益义卖"
  | "公司展示"
  | "其他"

export interface Conflict {
  type: "adjacent_type" | "power_overload" | "aisle_blocked"
  message: string
  related_booth_id?: number
}

export interface Application {
  id: number
  exhibition_id: number
  booth_id: number
  vendor_name: string
  brand: string
  product_type: ProductType
  power_watts: number
  tables: number
  chairs: number
  has_open_flame: boolean
  contact_name: string
  contact_phone: string
  status: ApplicationStatus
  conflicts: Conflict[]
  created_at: string
}

export interface SetupRecord {
  id: number
  application_id: number
  booth_id: number
  check_in_time: string | null
  is_late: boolean
  swap_to_booth_id: number | null
  swap_reason: string | null
  application?: Application
  booth?: Booth
}

export interface StatsUtilization {
  date: string
  rate: number
}

export interface StatsTypeDistribution {
  type: ProductType
  count: number
}

export interface StatsLateRanking {
  vendor_name: string
  late_count: number
  total_count: number
}

export interface Stats {
  utilization: StatsUtilization[]
  type_distribution: StatsTypeDistribution[]
  late_ranking: StatsLateRanking[]
  total_booths: number
  occupied_booths: number
  total_applications: number
  pending_applications: number
  conflict_count: number
}
