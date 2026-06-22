export type WaxStatus = 'waxing' | 'inspecting' | 'treeing' | 'casting';

export type DefectType = 'crack' | 'deform' | 'unclear';

export type SettingShape =
  | 'round'
  | 'oval'
  | 'pear'
  | 'emerald'
  | 'marquise'
  | 'heart'
  | 'princess'
  | 'cushion';

export type RodPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top_left'
  | 'top_right'
  | 'bottom_left'
  | 'bottom_right';

export interface StatusHistory {
  status: WaxStatus;
  timestamp: number;
  note?: string;
}

export interface WaxModel {
  id: string;
  orderNo: string;
  ringSize: string;
  weight: number;
  settingShape: SettingShape;
  stoneSize: string;
  rodPosition: RodPosition;
  status: WaxStatus;
  defects: DefectType[];
  remakeReason?: string;
  createdAt: number;
  updatedAt: number;
  history: StatusHistory[];
}

export type WaxFormInput = Omit<
  WaxModel,
  | 'id'
  | 'status'
  | 'defects'
  | 'createdAt'
  | 'updatedAt'
  | 'history'
>;
