import { create } from "zustand";
import type { FamilyMember } from "@/types";
import { mockMembers } from "@/data/mockData";

interface MemberStore {
  members: FamilyMember[];
}

export const useMemberStore = create<MemberStore>(() => ({
  members: mockMembers,
}));
