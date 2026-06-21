import type { Member, Scheme, AuditionScore } from '@/types';
import { VOICE_PARTS } from '@/utils/constants';
import { generateId, now } from '@/utils/helpers';

const NAMES: Record<string, string[]> = {
  soprano: ['林婉清', '陈雨桐', '苏梦瑶', '赵雅琴', '白雪薇', '周晓彤'],
  alto: ['黄诗涵', '吴嘉怡', '郑美玲', '孙若曦', '钱语嫣', '李静姝'],
  tenor: ['王志远', '刘浩然', '张明轩', '何俊豪', '罗天宇', '谢文博'],
  bass: ['马正阳', '朱伟强', '胡建国', '郭振东', '高峰', '宋海涛'],
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildMembers(): Member[] {
  const members: Member[] = [];
  for (const part of VOICE_PARTS) {
    const names = NAMES[part];
    for (let i = 0; i < names.length; i++) {
      members.push({
        id: generateId('m'),
        name: names[i],
        voicePart: part,
        vocalPower: randomInt(5, 9),
        vocalRange: randomInt(5, 9),
        experience: randomInt(4, 9),
        createdAt: now(),
      });
    }
  }
  return members;
}

export const MOCK_MEMBERS: Member[] = buildMembers();

export function buildInitialScheme(members: Member[]): Scheme {
  const rows = 4;
  const cols = 6;
  const schemeId = generateId('sch');

  const layout: (string | null)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  );

  const sops = members.filter(m => m.voicePart === 'soprano');
  const altos = members.filter(m => m.voicePart === 'alto');
  const tenors = members.filter(m => m.voicePart === 'tenor');
  const basses = members.filter(m => m.voicePart === 'bass');

  function fill(row: number, startCol: number, list: Member[], count: number, reverse = false) {
    const items = list.slice(0, count);
    if (reverse) items.reverse();
    for (let i = 0; i < items.length; i++) {
      layout[row][startCol + i] = items[i].id;
    }
  }

  fill(0, 0, sops, 3);
  fill(0, 3, altos, 3);
  fill(1, 0, sops, 3, true);
  fill(1, 3, altos, 3, true);
  fill(2, 0, tenors, 3);
  fill(2, 3, basses, 3);
  fill(3, 0, tenors, 3, true);
  fill(3, 3, basses, 3, true);

  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({
        id: generateId('pos'),
        schemeId,
        memberId: layout[r][c],
        row: r,
        col: c,
      });
    }
  }

  return {
    id: schemeId,
    name: '经典混声排布方案',
    notes: '传统左高右低分层排布，适合古典合唱曲目',
    gridRows: rows,
    gridCols: cols,
    positions,
    createdAt: now(),
    updatedAt: now(),
    overallScore: 78,
  };
}

export const MOCK_AUDITION_SCORES: Omit<AuditionScore, 'id' | 'schemeId' | 'recordedAt'>[] = [
  {
    passage: '主歌段落',
    balance: 82,
    clarity: 75,
    blend: 78,
    comment: '主歌整体平衡不错，女高音略突出',
  },
  {
    passage: '副歌段落',
    balance: 76,
    clarity: 80,
    blend: 72,
    comment: '副歌男低音需要再扎实一些',
  },
];
