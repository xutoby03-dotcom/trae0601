import type { Model, Stage, PaintFormula, Photo, DryingTimer } from '@/types';
import { STAGE_ORDER } from '@/types';
import { generateId } from '@/utils/time';

const createStagesForModel = (modelId: string, currentStageIndex: number): Stage[] => {
  return STAGE_ORDER.map((stage, index) => ({
    id: generateId(),
    modelId,
    name: stage,
    status: index < currentStageIndex ? 'completed' : index === currentStageIndex ? 'active' : 'pending',
    startedAt: index <= currentStageIndex ? new Date(Date.now() - (currentStageIndex - index) * 86400000 * 2).toISOString() : undefined,
    completedAt: index < currentStageIndex ? new Date(Date.now() - (currentStageIndex - index - 1) * 86400000 * 2).toISOString() : undefined,
  }));
};

const now = new Date();
const tenDaysAgo = new Date(now.getTime() - 10 * 86400000).toISOString();
const threeDaysAgo = new Date(now.getTime() - 3 * 86400000).toISOString();
const twelveDaysAgo = new Date(now.getTime() - 12 * 86400000).toISOString();

export const mockModels: Model[] = [
  {
    id: 'model-1',
    name: 'RX-78-2 高达',
    scale: '1/100',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gundam%20rx78%20mecha%20robot%20white%20blue%20red%20model%20kit&image_size=square',
    currentStage: 'painting',
    nextAction: '完成主体蓝色涂装',
    progress: 50,
    createdAt: tenDaysAgo,
    updatedAt: threeDaysAgo,
    isOnShelf: false,
    staleDays: 0,
  },
  {
    id: 'model-2',
    name: '扎古 II MS-06',
    scale: '1/144',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=zaku%20mecha%20robot%20green%20military%20model%20kit&image_size=square',
    currentStage: 'primer',
    nextAction: '喷涂水补土底漆',
    progress: 16,
    createdAt: threeDaysAgo,
    updatedAt: threeDaysAgo,
    isOnShelf: false,
    staleDays: 0,
  },
  {
    id: 'model-3',
    name: '虎式坦克 中期型',
    scale: '1/35',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tiger%20tank%20military%20model%20kit%20german%20ww2&image_size=square',
    currentStage: 'weathering',
    nextAction: '添加泥浆效果和滤镜',
    progress: 83,
    createdAt: tenDaysAgo,
    updatedAt: twelveDaysAgo,
    isOnShelf: true,
    shelfReason: 'replan',
    staleDays: 12,
  },
  {
    id: 'model-4',
    name: '飞翼零式高达 EW',
    scale: '1/100',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wing%20gundam%20zero%20ew%20mecha%20robot%20white%20model%20kit&image_size=square',
    currentStage: 'panel-lining',
    nextAction: '进行黑色渗线',
    progress: 66,
    createdAt: tenDaysAgo,
    updatedAt: twelveDaysAgo,
    isOnShelf: true,
    shelfReason: 'touch-up',
    staleDays: 12,
  },
  {
    id: 'model-5',
    name: '红异端高达',
    scale: '1/100',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gundam%20astray%20red%20frame%20mecha%20robot%20model%20kit&image_size=square',
    currentStage: 'completed',
    nextAction: '展示成品',
    progress: 100,
    createdAt: tenDaysAgo,
    updatedAt: threeDaysAgo,
    isOnShelf: false,
    staleDays: 0,
  },
];

export const mockStages: Stage[] = [
  ...createStagesForModel('model-1', 2),
  ...createStagesForModel('model-2', 0),
  ...createStagesForModel('model-3', 4),
  ...createStagesForModel('model-4', 3),
  ...createStagesForModel('model-5', 5),
];

export const mockFormulas: PaintFormula[] = [
  {
    id: 'formula-1',
    modelId: 'model-1',
    stageId: mockStages[2].id,
    brand: 'Mr.Hobby',
    code: 'GX-110',
    color: '#1E40AF',
    dilutionRatio: '1:1',
    usedOn: '主体装甲',
    notes: '郡士GX系列深蓝',
  },
  {
    id: 'formula-2',
    modelId: 'model-1',
    stageId: mockStages[2].id,
    brand: 'Mr.Hobby',
    code: 'GX-2',
    color: '#FFFFFF',
    dilutionRatio: '1:1',
    usedOn: '胸部、裙甲',
    notes: 'GX白，光泽质感',
  },
  {
    id: 'formula-3',
    modelId: 'model-1',
    stageId: mockStages[2].id,
    brand: 'Mr.Hobby',
    code: 'GX-3',
    color: '#DC2626',
    dilutionRatio: '1:1',
    usedOn: '盾牌、脚部',
    notes: 'GX红',
  },
  {
    id: 'formula-4',
    modelId: 'model-1',
    stageId: mockStages[0].id,
    brand: 'Mr.Hobby',
    code: 'SF-283',
    color: '#808080',
    dilutionRatio: '1:2',
    usedOn: '全身水补土',
    notes: '灰色水补土1000号',
  },
  {
    id: 'formula-5',
    modelId: 'model-3',
    stageId: mockStages[14].id,
    brand: 'Tamiya',
    code: 'XF-60',
    color: '#4A5D23',
    dilutionRatio: '1:1',
    usedOn: '全车涂装',
    notes: '田宫暗黄色',
  },
  {
    id: 'formula-6',
    modelId: 'model-5',
    stageId: mockStages[20].id,
    brand: 'Mr.Hobby',
    code: 'GP-01',
    color: '#DC2626',
    dilutionRatio: '1:1',
    usedOn: '外装甲',
    notes: 'GP系列金属红',
  },
];

export const mockPhotos: Photo[] = [
  {
    id: 'photo-1',
    modelId: 'model-1',
    stageId: mockStages[0].id,
    data: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gundam%20primer%20coat%20gray%20model%20kit%20work%20in%20progress&image_size=square',
    caption: '水补土喷涂完成',
    createdAt: tenDaysAgo,
  },
  {
    id: 'photo-2',
    modelId: 'model-1',
    stageId: mockStages[1].id,
    data: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gundam%20masking%20tape%20model%20kit%20painting&image_size=square',
    caption: '遮盖带分区',
    createdAt: eightDaysAgo(),
  },
  {
    id: 'photo-3',
    modelId: 'model-1',
    stageId: mockStages[2].id,
    data: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gundam%20blue%20paint%20model%20kit%20airbrush&image_size=square',
    caption: '蓝色涂装进行中',
    createdAt: threeDaysAgo,
  },
  {
    id: 'photo-4',
    modelId: 'model-3',
    stageId: mockStages[12].id,
    data: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tiger%20tank%20model%20camouflage%20paint&image_size=square',
    caption: '迷彩喷涂完成',
    createdAt: twelveDaysAgo,
  },
  {
    id: 'photo-5',
    modelId: 'model-5',
    stageId: mockStages[20].id,
    data: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gundam%20completed%20red%20frame%20finished%20model&image_size=square',
    caption: '成品展示',
    createdAt: threeDaysAgo,
  },
];

function eightDaysAgo(): string {
  return new Date(now.getTime() - 8 * 86400000).toISOString();
}

export const mockTimers: DryingTimer[] = [
  {
    id: 'timer-1',
    modelId: 'model-1',
    duration: 30,
    remaining: 1800,
    isRunning: true,
    startTime: new Date().toISOString(),
  },
];
