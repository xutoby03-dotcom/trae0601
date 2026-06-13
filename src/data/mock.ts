import type { DewormRecord, Pet, WeightHistory } from "../types";
import { addDays, formatDate } from "../utils/date";
import { getNextDewormDate } from "../utils/deworm";

const today = new Date();

export const mockPets: Pet[] = [
  {
    id: "pet-001",
    name: "橘子",
    species: "cat",
    breed: "中华田园猫",
    weight: 4.5,
    weightUnit: "kg",
    birthDate: "2022-03-15",
    allergies: "对牛肉过敏，偶有皮肤瘙痒",
    photoUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20orange%20tabby%20cat%20sitting%20on%20cozy%20blanket%20soft%20lighting%20realistic%20photo&image_size=square",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2025-05-20T10:30:00Z",
  },
  {
    id: "pet-002",
    name: "可乐",
    species: "dog",
    breed: "柯基",
    weight: 11.2,
    weightUnit: "kg",
    birthDate: "2021-08-20",
    allergies: "无",
    photoUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=happy%20welsh%20corgi%20dog%20outdoor%20sunny%20day%20realistic%20photo&image_size=square",
    createdAt: "2024-01-10T08:05:00Z",
    updatedAt: "2025-06-01T09:00:00Z",
  },
];

export const mockWeightHistory: WeightHistory[] = [
  {
    id: "wh-001",
    petId: "pet-001",
    weight: 4.2,
    recordedAt: "2025-01-15",
  },
  {
    id: "wh-002",
    petId: "pet-001",
    weight: 4.5,
    recordedAt: formatDate(today),
  },
  {
    id: "wh-003",
    petId: "pet-002",
    weight: 12.5,
    recordedAt: "2025-02-01",
  },
  {
    id: "wh-004",
    petId: "pet-002",
    weight: 11.2,
    recordedAt: formatDate(today),
  },
];

const makeRecord = (
  id: string,
  petId: string,
  daysAgoUsed: number,
  type: "internal" | "external",
  medicine: string,
  dosage: number,
  hasReaction = false
): DewormRecord => {
  const usedDate = addDays(today, -daysAgoUsed);
  const dateUsed = formatDate(usedDate);
  const nextDate = getNextDewormDate(dateUsed, type);
  return {
    id,
    petId,
    medicineName: medicine,
    type,
    dosage,
    dosageUnit: type === "external" ? "ml" : "片",
    dateUsed,
    nextDate,
    operator: "妈妈",
    hasAdverseReaction: hasReaction,
    reactionNote: hasReaction ? "用药后出现轻微呕吐，持续4小时后恢复" : "",
    createdAt: usedDate.toISOString(),
  };
};

export const mockRecords: DewormRecord[] = [
  makeRecord("rec-001", "pet-001", 100, "internal", "拜宠清", 0.5),
  makeRecord("rec-002", "pet-001", 40, "external", "大宠爱", 0.75),
  makeRecord("rec-003", "pet-001", 5, "internal", "拜宠清", 0.5, true),
  makeRecord("rec-004", "pet-002", 95, "internal", "犬心保", 1),
  makeRecord("rec-005", "pet-002", 25, "external", "福来恩", 1.34),
  makeRecord("rec-006", "pet-002", 1, "external", "福来恩", 1.34),
];
