export const AVATAR_COLORS = [
  "#FF7A45",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#14B8A6",
  "#6366F1",
  "#F97316",
  "#06B6D4",
];

export const pickColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const DEPARTMENT_COLOR: Record<string, string> = {
  技术部: "#3B82F6",
  产品部: "#8B5CF6",
  设计部: "#EC4899",
  运营部: "#22C55E",
  市场部: "#F59E0B",
  人事部: "#14B8A6",
  财务部: "#6366F1",
};

export const SPICE_COLOR: Record<string, string> = {
  不辣: "#22C55E",
  微辣: "#F59E0B",
  中辣: "#F97316",
  特辣: "#EF4444",
};
