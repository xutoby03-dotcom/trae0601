export type ColorCategory = "light" | "dark" | "medium";

export type MaterialCategory =
  | "cotton"
  | "wool"
  | "silk"
  | "synthetic"
  | "denim"
  | "towel"
  | "underwear"
  | "other";

export type ClothingCategory =
  | "top"
  | "pants"
  | "underwear"
  | "socks"
  | "towel"
  | "coat"
  | "other";

export type ConflictType =
  | "color"
  | "wool"
  | "towel"
  | "underwear"
  | "temperature";

export interface Member {
  id: string;
  name: string;
  avatar: string;
}

export interface Clothing {
  id: string;
  name: string;
  color: string;
  colorCategory: ColorCategory;
  material: MaterialCategory;
  colorfast: boolean;
  suggestedTemp: number;
  memberId: string;
  photoUrl: string;
  category: ClothingCategory;
  createdAt: string;
}

export interface Conflict {
  id: string;
  clothingId1: string;
  clothingId2: string;
  type: ConflictType;
  description: string;
}

export interface Washer {
  id: string;
  clothingIds: string[];
  conflicts: Conflict[];
  createdAt: string;
}

export interface WashHistory {
  id: string;
  clothingIds: string[];
  conflicts: Conflict[];
  completedAt: string;
  memberStats: Record<string, number>;
}

export const MATERIAL_LABELS: Record<MaterialCategory, string> = {
  cotton: "棉",
  wool: "羊毛",
  silk: "丝绸",
  synthetic: "化纤",
  denim: "牛仔",
  towel: "毛巾",
  underwear: "内衣面料",
  other: "其他",
};

export const COLOR_CATEGORY_LABELS: Record<ColorCategory, string> = {
  light: "浅色",
  dark: "深色",
  medium: "中色",
};

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  top: "上衣",
  pants: "裤子",
  underwear: "内衣",
  socks: "袜子",
  towel: "毛巾",
  coat: "外套",
  other: "其他",
};

export const CATEGORY_EMOJIS: Record<ClothingCategory, string> = {
  top: "👕",
  pants: "👖",
  underwear: "🩲",
  socks: "🧦",
  towel: "🧴",
  coat: "🧥",
  other: "👔",
};

export const CONFLICT_TYPE_LABELS: Record<ConflictType, string> = {
  color: "颜色深浅冲突",
  wool: "羊毛材质冲突",
  towel: "毛巾混洗冲突",
  underwear: "内衣外衣冲突",
  temperature: "水温要求冲突",
};

export const CONFLICT_TYPE_COLORS: Record<ConflictType, string> = {
  color: "#EF5350",
  wool: "#FFA726",
  towel: "#AB47BC",
  underwear: "#EC407A",
  temperature: "#26A69A",
};
