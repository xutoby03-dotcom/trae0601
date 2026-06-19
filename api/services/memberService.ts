import { readJsonFile, writeJsonFile, generateId } from '../storage/jsonFileStorage.js';
import type { Member } from '../../shared/types.js';

export async function getAllMembers(): Promise<Member[]> {
  return readJsonFile<Member[]>('members.json');
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  const members = await getAllMembers();
  return members.find(m => m.id === id);
}

export async function createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'confirmed'>): Promise<Member> {
  const members = await getAllMembers();
  const newMember: Member = {
    ...memberData,
    id: generateId(),
    confirmed: false,
    createdAt: new Date().toISOString(),
  };
  members.push(newMember);
  await writeJsonFile('members.json', members);
  return newMember;
}

export async function updateMember(id: string, memberData: Partial<Member>): Promise<Member | undefined> {
  const members = await getAllMembers();
  const index = members.findIndex(m => m.id === id);
  if (index === -1) return undefined;
  
  members[index] = { ...members[index], ...memberData };
  await writeJsonFile('members.json', members);
  return members[index];
}

export async function deleteMember(id: string): Promise<boolean> {
  const members = await getAllMembers();
  const filtered = members.filter(m => m.id !== id);
  if (filtered.length === members.length) return false;
  
  await writeJsonFile('members.json', filtered);
  return true;
}

export async function confirmMember(id: string): Promise<Member | undefined> {
  return updateMember(id, { confirmed: true });
}

export async function getUnconfirmedMembers(): Promise<Member[]> {
  const members = await getAllMembers();
  return members.filter(m => !m.confirmed);
}
