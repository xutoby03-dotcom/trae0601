import type { FilterPreset } from '@/types';

export const PRESET_FILTERS: FilterPreset[] = [
  {
    id: 'summer-shirt-opaque',
    name: '适合夏季衬衫但不透',
    description: '轻薄、透气、不透光',
    filters: {
      season: ['summer'],
      thicknessMax: 50,
      thicknessMin: 10,
      translucencyMax: 40,
      weightMax: 200,
      coolnessMin: 50,
    },
  },
  {
    id: 'drape-not-tight',
    name: '有垂感又不贴身',
    description: '垂坠感好，弹力适中不会太贴',
    filters: {
      drapeMin: 70,
      elasticityMax: 50,
      elasticityMin: 10,
    },
  },
  {
    id: 'suiting-stiff',
    name: '挺括西装料',
    description: '塑形好，有分量感',
    filters: {
      stiffnessMin: 70,
      weightMin: 250,
      thicknessMin: 50,
    },
  },
  {
    id: 'soft-underwear',
    name: '柔软贴身内衣',
    description: '亲肤柔软，有弹力',
    filters: {
      softnessMin: 80,
      elasticityMin: 60,
      coolnessMin: 40,
      roughnessMax: 20,
    },
  },
  {
    id: 'winter-coat',
    name: '秋冬大衣料',
    description: '厚实保暖，有分量',
    filters: {
      season: ['autumn', 'winter'],
      weightMin: 350,
      thicknessMin: 70,
      coolnessMax: 40,
    },
  },
  {
    id: 'textured-rough',
    name: '粗糙肌理感',
    description: '有明显肌理，独特质感',
    filters: {
      roughnessMin: 60,
      stiffnessMin: 40,
    },
  },
];
