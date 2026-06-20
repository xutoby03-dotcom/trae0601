import type { Play, Scene, Cue, Prop, PropFlow, Issue, CheckItem } from '@/types';

export const plays: Play[] = [
  {
    id: 'play-1',
    name: '雷雨',
    description: '曹禺经典话剧',
    totalScenes: 4,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'play-2',
    name: '茶馆',
    description: '老舍经典话剧',
    totalScenes: 3,
    createdAt: '2024-02-20T14:30:00Z',
  },
];

export const scenes: Scene[] = [
  { id: 'scene-1', playId: 'play-1', name: '第一幕', order: 1, description: '周家客厅' },
  { id: 'scene-2', playId: 'play-1', name: '第二幕', order: 2, description: '周家花园' },
  { id: 'scene-3', playId: 'play-1', name: '第三幕', order: 3, description: '鲁家' },
  { id: 'scene-4', playId: 'play-1', name: '第四幕', order: 4, description: '周家客厅（夜' },
  { id: 'scene-5', playId: 'play-2', name: '第一幕', order: 1, description: '戊戌变法' },
  { id: 'scene-6', playId: 'play-2', name: '第二幕', order: 2, description: '民国初年' },
  { id: 'scene-7', playId: 'play-2', name: '第三幕', order: 3, description: '抗战胜利' },
];

export const cues: Cue[] = [
  { id: 'cue-1', sceneId: 'scene-1', number: 1, name: '开场', description: '大幕拉开' },
  { id: 'cue-2', sceneId: 'scene-1', number: 2, name: '周朴园上场', description: '周朴园从右门上' },
  { id: 'cue-3', sceneId: 'scene-1', number: 3, name: '鲁侍萍上场', description: '鲁侍萍从左门上' },
  { id: 'cue-4', sceneId: 'scene-1', number: 4, name: '相认', description: '周朴园认出侍萍' },
  { id: 'cue-5', sceneId: 'scene-2', number: 1, name: '花园场景', description: '转场到花园' },
  { id: 'cue-6', sceneId: 'scene-2', number: 2, name: '繁漪出场', description: '繁漪出场' },
  { id: 'cue-7', sceneId: 'scene-3', number: 1, name: '鲁家场景', description: '转场到鲁家' },
  { id: 'cue-8', sceneId: 'scene-4', number: 1, name: '雨夜', description: '最后一幕开场' },
];

export const props: Prop[] = [
  { id: 'prop-1', name: '油纸伞', category: '雨具', description: '黑色油纸伞，侍萍用' },
  { id: 'prop-2', name: '信封', category: '文书', description: '周朴园给侍萍的信封' },
  { id: 'prop-3', name: '茶杯', category: '茶具', description: '景德镇瓷茶杯' },
  { id: 'prop-4', name: '照片', category: '装饰', description: '侍萍年轻时的照片' },
  { id: 'prop-5', name: '手枪', category: '道具', description: '周萍用的道具手枪' },
  { id: 'prop-6', name: '药碗', category: '道具', description: '繁漪喝药的碗' },
  { id: 'prop-7', name: '围巾', category: '服饰', description: '周冲的围巾' },
  { id: 'prop-8', name: '台灯', category: '家具', description: '书桌上的台灯' },
  { id: 'prop-9', name: '报纸', category: '道具', description: '当天的报纸' },
  { id: 'prop-10', name: '毛巾', category: '生活用品', description: '擦脸毛巾' },
];

export const propFlows: PropFlow[] = [
  { id: 'pf-1', cueId: 'cue-1', propId: 'prop-1', from: '左侧台口', to: '道具桌A', handler: '道具师甲', receiver: '侍萍扮演者', status: 'pending' },
  { id: 'pf-2', cueId: 'cue-1', propId: 'prop-3', from: '道具柜', to: '茶几', handler: '道具师乙', receiver: '四凤', status: 'pending' },
  { id: 'pf-3', cueId: 'cue-1', propId: 'prop-8', from: '道具库', to: '书桌', handler: '道具师甲', receiver: '道具师乙', status: 'confirmed' },
  { id: 'pf-4', cueId: 'cue-2', propId: 'prop-2', from: '书桌抽屉', to: '周朴园手中', handler: '道具师甲', receiver: '周朴园扮演者', status: 'pending' },
  { id: 'pf-5', cueId: 'cue-2', propId: 'prop-9', from: '道具桌B', to: '沙发旁', handler: '道具师乙', receiver: '道具师甲', status: 'pending' },
  { id: 'pf-6', cueId: 'cue-3', propId: 'prop-4', from: '保险箱', to: '周朴园手中', handler: '道具师甲', receiver: '周朴园扮演者', status: 'pending' },
  { id: 'pf-7', cueId: 'cue-4', propId: 'prop-6', from: '厨房', to: '繁漪手中', handler: '四凤', receiver: '繁漪扮演者', status: 'issue' },
  { id: 'pf-8', cueId: 'cue-5', propId: 'prop-7', from: '衣架', to: '周冲手中', handler: '道具师乙', receiver: '周冲扮演者', status: 'pending' },
  { id: 'pf-9', cueId: 'cue-6', propId: 'prop-10', from: '浴室', to: '脸盆架', handler: '道具师甲', receiver: '道具师乙', status: 'pending' },
  { id: 'pf-10', cueId: 'cue-7', propId: 'prop-5', from: '抽屉', to: '周萍手中', handler: '道具师甲', receiver: '周萍扮演者', status: 'pending' },
];

export const issues: Issue[] = [
  {
    id: 'issue-1',
    propId: 'prop-6',
    propFlowId: 'pf-7',
    type: 'damaged',
    description: '药碗有裂痕，需要更换',
    reportedAt: '2024-03-10T15:30:00Z',
    resolved: false,
  },
  {
    id: 'issue-2',
    propId: 'prop-1',
    propFlowId: 'pf-1',
    type: 'wrong_position',
    description: '伞放错了桌子，应该在B桌',
    reportedAt: '2024-03-10T16:00:00Z',
    resolved: false,
  },
];

export const checkItems: CheckItem[] = [
  { id: 'ci-1', propId: 'prop-6', issueId: 'issue-1', priority: 'high', checked: false },
  { id: 'ci-2', propId: 'prop-1', issueId: 'issue-2', priority: 'medium', checked: false },
  { id: 'ci-3', propId: 'prop-5', priority: 'low', checked: true, checkedAt: '2024-03-11T09:00:00Z', note: '已检查，功能正常' },
];
