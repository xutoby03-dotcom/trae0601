import { Skill } from '../types';

export const SKILLS: Skill[] = [
  {
    id: 'fireball',
    name: '火球术',
    description: '发射一颗火球，造成魔法伤害',
    mpCost: 10,
    damage: 30,
    type: 'attack',
  },
  {
    id: 'ice_spike',
    name: '冰锥术',
    description: '召唤冰锥刺穿敌人',
    mpCost: 12,
    damage: 35,
    type: 'attack',
  },
  {
    id: 'heal',
    name: '治愈术',
    description: '恢复自身生命值',
    mpCost: 15,
    damage: 50,
    type: 'heal',
  },
  {
    id: 'thunder',
    name: '雷霆一击',
    description: '召唤雷电轰击敌人，造成大量伤害',
    mpCost: 25,
    damage: 60,
    type: 'attack',
  },
];
