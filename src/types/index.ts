export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

export type Atmosphere = "氧化" | "还原";

export type ColorFamily =
  | "青瓷系"
  | "酱釉系"
  | "蓝釉系"
  | "白釉系"
  | "黑釉系"
  | "花釉系"
  | "结晶釉系";

export type Glossiness = "哑光" | "半哑光" | "半光泽" | "高光";

export interface RecipeIngredient {
  name: string;
  percentage: number;
}

export interface GlazeRecipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  notes?: string;
}

export interface TestSample {
  id: string;
  name: string;
  code: string;
  colorFamily: ColorFamily;
  hexColor: string;
  frontImage: string;
  backImage: string;
  firingTemperature: number;
  atmosphere: Atmosphere;
  clayType: string;
  glazeName: string;
  kilnPosition: string;
  firingDate: string;
  flowGrade: Grade;
  pinholeGrade: Grade;
  crazingGrade: Grade;
  glossiness: Glossiness;
  touchFeel: string;
  recipe: GlazeRecipe;
  evolutionChainId: string;
  version: number;
  previousVersionId?: string;
  nextVersionId?: string;
  notes?: string;
  suitableFor: string[];
}

export interface EvolutionChain {
  id: string;
  name: string;
  description: string;
  sampleIds: string[];
}

export interface FilterState {
  colorFamily: ColorFamily | "全部";
  temperatureRange: [number, number] | null;
  clayType: string | "全部";
  atmosphere: Atmosphere | "全部";
  kilnPosition: string | "全部";
  searchKeyword: string;
}

export const COLOR_FAMILIES: ColorFamily[] = [
  "青瓷系",
  "酱釉系",
  "蓝釉系",
  "白釉系",
  "黑釉系",
  "花釉系",
  "结晶釉系",
];

export const CLAY_TYPES = ["高岭土", "紫砂泥", "瓷泥", "粗陶泥", "段泥"];

export const KILN_POSITIONS = ["前膛", "中膛", "后膛", "上棚", "下棚"];

export const COLOR_FAMILY_MAP: Record<ColorFamily, string> = {
  青瓷系: "#5B8A72",
  酱釉系: "#A34B3B",
  蓝釉系: "#3B5A8A",
  白釉系: "#E8E1D5",
  黑釉系: "#2C2420",
  花釉系: "#8B5A8A",
  结晶釉系: "#D4A853",
};
