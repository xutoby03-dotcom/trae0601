export type MobilityType = "normal" | "slow" | "wheelchair" | "bedridden";

export interface Elder {
  id: string;
  name: string;
  gender: "male" | "female";
  age: number;
  address: string;
  mobility: MobilityType;
  allergies: string;
  usualHairstyle: string;
  contactName: string;
  contactPhone: string;
  photo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const mobilityLabels: Record<MobilityType, string> = {
  normal: "行动正常",
  slow: "行动缓慢",
  wheelchair: "需轮椅",
  bedridden: "卧床不起",
};

export const genderLabels: Record<string, string> = {
  male: "男",
  female: "女",
};
