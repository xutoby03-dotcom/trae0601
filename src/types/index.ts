export type BoxCondition = "全新" | "轻微使用" | "正常使用" | "明显磨损" | "损坏";
export type LendingStatus = "借出中" | "已归还" | "逾期";
export type ComponentType = "卡牌" | "骰子" | "说明书" | "计分板" | "棋子" | "标记物" | "其他";
export type RepairStatus = "待采购" | "已采购" | "已补齐";

export interface Game {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  duration: number;
  boxCondition: BoxCondition;
  coverImage: string;
  wantToPlay: boolean;
  wantToPlayAt: string | null;
  createdAt: string;
}

export interface GameComponent {
  id: string;
  gameId: string;
  name: string;
  quantity: number;
  type: ComponentType;
}

export interface LendingRecord {
  id: string;
  gameId: string;
  borrowerName: string;
  borrowerContact: string;
  dueDate: string;
  deposit: number;
  lentAt: string;
  returnedAt: string | null;
  status: LendingStatus;
}

export interface ComponentCheck {
  id: string;
  lendingRecordId: string;
  componentId: string;
  lentQuantity: number;
  returnedQuantity: number;
  isComplete: boolean;
}

export interface RepairRecord {
  id: string;
  gameId: string;
  lendingRecordId: string;
  componentName: string;
  missingQuantity: number;
  status: RepairStatus;
  createdAt: string;
}
