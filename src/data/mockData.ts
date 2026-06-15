import { BirthdayPlan, TaskColumn } from '../types';
import { generateCodeName, generateId, getAvatarColor } from '../utils';

const participants = [
  { id: generateId(), name: '小美', avatarColor: getAvatarColor(0), isMainCharacter: true },
  { id: generateId(), name: '阿杰', avatarColor: getAvatarColor(1), isMainCharacter: false },
  { id: generateId(), name: '莉莉', avatarColor: getAvatarColor(2), isMainCharacter: false },
  { id: generateId(), name: '大伟', avatarColor: getAvatarColor(3), isMainCharacter: false },
  { id: generateId(), name: '思思', avatarColor: getAvatarColor(4), isMainCharacter: false },
];

const [, p1, p2, p3, p4] = participants;

const today = new Date();
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const dateStr = nextWeek.toISOString().split('T')[0];

function makeTask(column: TaskColumn, title: string, assigneeId: string | null, deadline: string, budget: number, isSecret: boolean, isPaid: boolean, notes: string) {
  return {
    id: generateId(),
    column,
    title,
    codeName: generateCodeName(),
    assigneeId,
    deadline,
    budget,
    isPaid,
    photoEvidence: [],
    isSecret,
    completed: false,
    notes,
  };
}

export const mockPlan: BirthdayPlan = {
  id: generateId(),
  mainCharacter: '小美',
  date: dateStr,
  meetingPoint: '新天地KTV 302包厢',
  totalBudget: 3000,
  secrecyLevel: 'high',
  participants,
  tasks: [
    makeTask('secret', '定生日蛋糕（榴莲千层，不能被她知道）', p1.id, dateStr, 588, true, false, '记得写"小美永远18岁"，提前一天取'),
    makeTask('secret', '买气球+彩带+生日帽装饰', p2.id, dateStr, 180, true, true, '买粉色系+氦气球，提前拿到莉莉家'),
    makeTask('secret', '剪辑祝福视频（问大家要素材）', p3.id, dateStr, 0, true, false, '每个人录10秒，剪在一起加个BGM'),
    makeTask('secret', '联系小美学姐把她骗出来', p4.id, dateStr, 0, true, false, '就说约了逛街，7点准时带到KTV'),
    makeTask('same_day', '7点前到场地布置', p1.id, dateStr, 0, false, false, '所有人6点半集合，吹气球贴照片'),
    makeTask('same_day', '取蛋糕+买饮品零食', p2.id, dateStr, 320, false, false, '蛋糕放冰箱，零食买她爱吃的芒果干'),
    makeTask('same_day', '调试音响和视频投影', p3.id, dateStr, 0, false, false, '带HDMI线，试一下祝福视频能不能放'),
    makeTask('same_day', '点蜡烛关灯待命', p4.id, dateStr, 0, false, false, '听到敲门声就点好蜡烛关灯'),
    makeTask('advance', '订KTV包厢（3-4小时）', p1.id, dateStr, 688, false, true, '要带投影的，确认7-11点档期'),
    makeTask('advance', '买生日礼物（限量款香水）', p2.id, dateStr, 899, false, false, '去专柜买，包装得好看点'),
    makeTask('advance', '准备拍照道具+相框', p3.id, dateStr, 120, false, false, 'ins风手持板、拍立得相纸20张'),
    makeTask('advance', '收尾：打扫+AA算账', p4.id, dateStr, 0, false, false, '散场后收拾垃圾，记好总账AA'),
  ],
  timeline: [
    { id: generateId(), time: '18:30', title: '集合准备', description: '所有人到KTV集合，拿好装饰物料', assigneeId: p1.id, icon: '🚪', order: 0, completed: false },
    { id: generateId(), time: '18:45', title: '布置场地', description: '吹气球、贴彩带、摆蛋糕、调试音响视频', assigneeId: null, icon: '🎈', order: 1, completed: false },
    { id: generateId(), time: '19:00', title: '接人出发', description: '学姐出发去接小美，路上稳住别露馅', assigneeId: p4.id, icon: '🚕', order: 2, completed: false },
    { id: generateId(), time: '19:10', title: '待命准备', description: '蛋糕放好、蜡烛插好、灯关掉、手机静音', assigneeId: p1.id, icon: '🕯️', order: 3, completed: false },
    { id: generateId(), time: '19:15', title: '惊喜登场', description: '小美推门→齐声生日快乐→点蜡烛→许愿→吹蜡烛', assigneeId: null, icon: '🎉', order: 4, completed: false },
    { id: generateId(), time: '19:30', title: '播放祝福视频', description: '大家围坐一起看视频，拍反应视频', assigneeId: p3.id, icon: '📹', order: 5, completed: false },
    { id: generateId(), time: '19:45', title: '送礼物环节', description: '依次送礼物+说祝福的话，用拍立得记录', assigneeId: null, icon: '🎁', order: 6, completed: false },
    { id: generateId(), time: '20:00', title: '切蛋糕+自由嗨', description: '切蛋糕、吃东西、唱歌、拍照自由活动', assigneeId: null, icon: '🎂', order: 7, completed: false },
    { id: generateId(), time: '22:45', title: '收拾场地', description: '收东西、检查遗留物品、打扫卫生', assigneeId: null, icon: '🧹', order: 8, completed: false },
    { id: generateId(), time: '23:00', title: 'AA算账', description: '总账算好发群里，多退少补', assigneeId: p4.id, icon: '💰', order: 9, completed: false },
  ],
};
