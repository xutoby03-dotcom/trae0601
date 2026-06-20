import type { Song, Tag, Section, Member } from '@/types';

const SONGS_KEY = 'band_rehearsal_songs';
const TAGS_KEY = 'band_rehearsal_tags';
const SECTIONS_KEY = 'band_rehearsal_sections';
const MEMBERS_KEY = 'band_rehearsal_members';

export function loadSongs(): Song[] {
  try {
    const data = localStorage.getItem(SONGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSongs(songs: Song[]): void {
  localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}

export function loadTags(): Tag[] {
  try {
    const data = localStorage.getItem(TAGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTags(tags: Tag[]): void {
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

export function loadSections(): Section[] {
  try {
    const data = localStorage.getItem(SECTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSections(sections: Section[]): void {
  localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
}

export function loadMembers(): Member[] {
  try {
    const data = localStorage.getItem(MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMembers(members: Member[]): void {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}
