import type { Clothing, Conflict } from "@/types";

export function detectConflicts(clothes: Clothing[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const seen = new Set<string>();

  const addConflict = (
    c1: Clothing,
    c2: Clothing,
    type: Conflict["type"],
    description: string
  ) => {
    const key = [c1.id, c2.id, type].sort().join("|");
    if (seen.has(key)) return;
    seen.add(key);
    conflicts.push({
      id: `conflict-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      clothingId1: c1.id,
      clothingId2: c2.id,
      type,
      description,
    });
  };

  for (let i = 0; i < clothes.length; i++) {
    for (let j = i + 1; j < clothes.length; j++) {
      const a = clothes[i];
      const b = clothes[j];

      const aIsLight = a.colorCategory === "light";
      const bIsLight = b.colorCategory === "light";
      const aIsDark = a.colorCategory === "dark";
      const bIsDark = b.colorCategory === "dark";
      const aWillBleed = a.colorfast || aIsDark;
      const bWillBleed = b.colorfast || bIsDark;

      if ((aIsLight && bWillBleed) || (bIsLight && aWillBleed)) {
        const lightOne = aIsLight ? a : b;
        const darkOne = aIsLight ? b : a;
        const reason =
          darkOne.colorfast && darkOne.material !== "towel"
            ? `【${darkOne.name}】标记为易掉色`
            : `【${darkOne.name}】属于深色衣物`;
        addConflict(
          a,
          b,
          "color",
          `浅色【${lightOne.name}】可能被${reason}染色，建议分开洗涤`
        );
      }

      const aIsWool = a.material === "wool";
      const bIsWool = b.material === "wool";
      if (aIsWool !== bIsWool) {
        const woolOne = aIsWool ? a : b;
        const otherOne = aIsWool ? b : a;
        addConflict(
          a,
          b,
          "wool",
          `【${woolOne.name}】为羊毛材质，不宜与【${otherOne.name}】混洗，建议单独冷水手洗或羊毛模式`
        );
      }

      const aIsTowel = a.category === "towel" || a.material === "towel";
      const bIsTowel = b.category === "towel" || b.material === "towel";
      if (aIsTowel !== bIsTowel) {
        const towelOne = aIsTowel ? a : b;
        const otherOne = aIsTowel ? b : a;
        addConflict(
          a,
          b,
          "towel",
          `【${towelOne.name}】为毛巾类，易掉毛粘毛，不宜与【${otherOne.name}】混洗`
        );
      }

      const aIsUnderwear =
        a.category === "underwear" || a.material === "underwear";
      const bIsUnderwear =
        b.category === "underwear" || b.material === "underwear";
      const aIsOuter = ["top", "pants", "coat", "socks"].includes(a.category);
      const bIsOuter = ["top", "pants", "coat", "socks"].includes(b.category);
      if ((aIsUnderwear && bIsOuter) || (bIsUnderwear && aIsOuter)) {
        const underOne = aIsUnderwear ? a : b;
        const outerOne = aIsUnderwear ? b : a;
        addConflict(
          a,
          b,
          "underwear",
          `【${underOne.name}】为贴身内衣，出于卫生考虑，不宜与【${outerOne.name}】等外衣混洗`
        );
      }

      if (Math.abs(a.suggestedTemp - b.suggestedTemp) > 20) {
        addConflict(
          a,
          b,
          "temperature",
          `水温要求差异过大：【${a.name}】建议${a.suggestedTemp}°C，【${b.name}】建议${b.suggestedTemp}°C`
        );
      }
    }
  }

  return conflicts;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const mins = Math.floor(diff / (1000 * 60));
      return mins <= 1 ? "刚刚" : `${mins}分钟前`;
    }
    return `${hours}小时前`;
  }
  if (days === 1) return "昨天";
  if (days < 7) return `${days}天前`;

  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function isWithinDays(dateStr: string, days: number): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return diff <= days * 24 * 60 * 60 * 1000;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
