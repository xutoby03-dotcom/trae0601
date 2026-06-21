import type { Book, Trial, Photo, Evaluation } from '@/types';

const wetPrompt = encodeURIComponent('ancient Chinese book restoration paper, wet state, semi-transparent, darker beige color, Xuan paper texture, close-up shot');
const halfDryPrompt = encodeURIComponent('ancient Chinese book restoration paper, half-dry state, color becoming lighter, Xuan paper texture, matte finish, close-up');
const fullDryPrompt = encodeURIComponent('ancient Chinese book restoration paper, fully dry state, natural Xuan paper color, matte texture, authentic ancient paper look, close-up');

const imageApi = (prompt: string) => 
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`;

export const mockBook: Book = {
  id: 'book-001',
  name: '金石录后序',
  dynasty: '宋代',
  bookNumber: 'GJ-2024-001',
  description: '李清照所著《金石录》后序，为宋代重要文献，本次修复为补配缺失书页。',
};

const createPhotos = (trialId: string, notes?: [string, string, string]): Photo[] => [
  {
    id: `photo-${trialId}-wet`,
    trialId,
    state: 'wet',
    dataUrl: imageApi(wetPrompt),
    fileName: 'wet-state.jpg',
    size: 1024000,
    note: notes?.[0] || '颜色较深，纸面透湿均匀，边缘整齐无起翘',
  },
  {
    id: `photo-${trialId}-half`,
    trialId,
    state: 'half_dry',
    dataUrl: imageApi(halfDryPrompt),
    fileName: 'half-dry-state.jpg',
    size: 980000,
    note: notes?.[1] || '颜色开始转浅，纸面有轻微收缩，纤维纹理渐显',
  },
  {
    id: `photo-${trialId}-full`,
    trialId,
    state: 'full_dry',
    dataUrl: imageApi(fullDryPrompt),
    fileName: 'full-dry-state.jpg',
    size: 950000,
    note: notes?.[2] || '颜色稳定，与原纸色差较小，浆糊无透印',
  },
];

const createEvaluation = (trialId: string, scores: [number, number, number, number], remarks: string): Evaluation => ({
  id: `eval-${trialId}`,
  trialId,
  colorDifference: scores[0],
  edgeWarping: scores[1],
  gluePenetration: scores[2],
  touchDifference: scores[3],
  remarks,
});

export const mockTrials: Trial[] = [
  {
    id: 'trial-001',
    bookId: 'book-001',
    version: 1,
    paperThickness: 0.08,
    fiberDirection: 'vertical',
    dyeRatio: '赭石1:藤黄20',
    pasteConcentration: 60,
    photos: createPhotos('trial-001', [
      '颜色较深，纸面透湿均匀，边缘整齐无起翘',
      '颜色开始转浅，纸面有轻微收缩，纤维纹理渐显',
      '颜色稳定，与原纸色差较小，浆糊无透印',
    ]),
    evaluation: createEvaluation(
      'trial-001',
      [2, 1, 2, 1],
      '颜色略深，干后色差较小，纤维方向与原纸一致，整体效果较好。浆糊浓度适中，无明显透胶现象。'
    ),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isSelected: true,
    isArchived: false,
  },
  {
    id: 'trial-002',
    bookId: 'book-001',
    version: 2,
    paperThickness: 0.07,
    fiberDirection: 'horizontal',
    dyeRatio: '赭石1:藤黄25',
    pasteConcentration: 45,
    photos: createPhotos('trial-002', [
      '颜色偏浅，透湿较快，纤维感明显',
      '收缩幅度大，四角出现轻微翘边，需注意压平',
      '',
    ]),
    evaluation: createEvaluation(
      'trial-002',
      [3, 3, 1, 3],
      '颜色较浅，半干时出现轻微翘边，透胶控制较好但触感偏薄。纤维方向为横向，与原纸纵向不符。'
    ),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isSelected: false,
    isArchived: false,
  },
];

export const mockInitialState = {
  currentBook: mockBook,
  trials: mockTrials,
  currentTrialId: 'trial-001',
};
