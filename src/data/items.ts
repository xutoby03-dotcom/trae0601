import { ItemTemplate } from '@/types';

export const itemTemplates: ItemTemplate[] = [
  {
    type: 'pot',
    name: '茶壶',
    defaultWidth: 70,
    defaultHeight: 70,
    description: '主泡器，茶席核心',
  },
  {
    type: 'gongdao',
    name: '公道杯',
    defaultWidth: 60,
    defaultHeight: 55,
    description: '均匀茶汤，分茶之用',
  },
  {
    type: 'cup',
    name: '品茗杯',
    defaultWidth: 40,
    defaultHeight: 40,
    description: '品饮茶汤之用',
  },
  {
    type: 'incense',
    name: '香插',
    defaultWidth: 35,
    defaultHeight: 35,
    description: '焚香怡情，茶席点缀',
  },
  {
    type: 'teaLeaf',
    name: '茶荷',
    defaultWidth: 55,
    defaultHeight: 40,
    description: '置茶观赏，引导干茶',
  },
  {
    type: 'flower',
    name: '花器',
    defaultWidth: 50,
    defaultHeight: 65,
    description: '插花供赏，茶席生色',
  },
];

export const getItemTemplate = (type: string): ItemTemplate | undefined => {
  return itemTemplates.find((item) => item.type === type);
};
