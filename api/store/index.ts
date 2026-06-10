import type { Activity, Registration } from '../../shared/types.js';

let activities: Activity[] = [];
let registrations: Registration[] = [];
let activityIdCounter = 1;
let registrationIdCounter = 1;

export const getActivities = (): Activity[] => [...activities];

export const getActivityById = (id: string): Activity | undefined =>
  activities.find((a) => a.id === id);

export const addActivity = (activity: Omit<Activity, 'id' | 'createdAt'>): Activity => {
  const newActivity: Activity = {
    ...activity,
    id: String(activityIdCounter++),
    createdAt: new Date().toISOString(),
  };
  activities.push(newActivity);
  return newActivity;
};

export const getRegistrations = (): Registration[] => [...registrations];

export const getRegistrationsByActivityId = (activityId: string): Registration[] =>
  registrations.filter((r) => r.activityId === activityId);

export const getRegistrationById = (id: string): Registration | undefined =>
  registrations.find((r) => r.id === id);

export const addRegistration = (
  registration: Omit<Registration, 'id' | 'createdAt' | 'checkInStatus' | 'promotedFromWaitlist'>,
): Registration => {
  const newRegistration: Registration = {
    ...registration,
    id: String(registrationIdCounter++),
    createdAt: new Date().toISOString(),
    checkInStatus: 'pending',
    promotedFromWaitlist: false,
  };
  registrations.push(newRegistration);
  return newRegistration;
};

export const updateRegistration = (
  id: string,
  updates: Partial<Registration>,
): Registration | undefined => {
  const index = registrations.findIndex((r) => r.id === id);
  if (index === -1) return undefined;
  registrations[index] = { ...registrations[index], ...updates };
  return registrations[index];
};

export const getActiveRegistrationsCount = (activityId: string): number =>
  registrations.filter((r) => r.activityId === activityId && r.status === 'registered').length;

export const getWaitlistCount = (activityId: string): number =>
  registrations.filter((r) => r.activityId === activityId && r.status === 'waitlist').length;

export const getNextWaitlist = (activityId: string): Registration | undefined => {
  const waitlist = registrations
    .filter((r) => r.activityId === activityId && r.status === 'waitlist')
    .sort((a, b) => a.waitlistPosition - b.waitlistPosition);
  return waitlist[0];
};

export const updateWaitlistPositions = (activityId: string): void => {
  const waitlist = registrations
    .filter((r) => r.activityId === activityId && r.status === 'waitlist')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  waitlist.forEach((r, index) => {
    const reg = registrations.find((item) => item.id === r.id);
    if (reg) {
      reg.waitlistPosition = index + 1;
    }
  });
};

export const seedData = (): void => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const seedActivities: Activity[] = [
    {
      id: '1',
      title: '人工智能前沿技术讲座',
      type: 'lecture',
      location: '图书馆学术报告厅',
      startTime: new Date(tomorrow.getTime() + 18 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(tomorrow.getTime() + 20 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 50,
      fee: 0,
      bringItems: '笔记本、笔',
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20university%20lecture%20hall%20with%20students%20listening%20to%20AI%20technology%20presentation%20warm%20lighting&image_size=landscape_16_9',
      description: '邀请知名AI专家分享人工智能领域的最新研究成果和应用前景，涵盖大语言模型、计算机视觉等前沿方向。',
      requiresApproval: false,
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      id: '2',
      title: '周末桌游狂欢夜',
      type: 'boardgame',
      location: '学生活动中心302室',
      startTime: new Date(dayAfter.getTime() + 19 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(dayAfter.getTime() + 22 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 20,
      fee: 10,
      bringItems: '水杯、个人桌游（可选）',
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20board%20game%20night%20with%20young%20people%20playing%20tabletop%20games%20warm%20ambient%20lighting%20fun%20atmosphere&image_size=landscape_16_9',
      description: '狼人杀、剧本杀、UNO、三国杀...各种桌游应有尽有！认识新朋友，享受策略与社交的乐趣。',
      requiresApproval: false,
      createdAt: yesterday.toISOString(),
    },
    {
      id: '3',
      title: '城市街拍外拍活动',
      type: 'photoshoot',
      location: '外滩集合',
      startTime: new Date(nextWeek.getTime() + 9 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(nextWeek.getTime() + 16 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 15,
      fee: 0,
      bringItems: '相机/手机、充电宝、防晒用品',
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20photography%20workshop%20young%20photographers%20taking%20photos%20in%20city%20street%20sunny%20day%20creative&image_size=landscape_16_9',
      description: '跟随摄影社资深社员一起扫街，学习构图、光线运用技巧，记录城市的美好瞬间。新手友好，提供相机租借。',
      requiresApproval: true,
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      id: '4',
      title: '敬老院志愿服务',
      type: 'volunteer',
      location: '阳光敬老院',
      startTime: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 25,
      fee: 0,
      bringItems: '志愿者服装（统一发放）、小礼物（可选）',
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=volunteer%20activity%20young%20people%20helping%20elderly%20people%20in%20nursing%20home%20warm%20caring%20atmosphere%20sunny&image_size=landscape_16_9',
      description: '陪伴老人聊天、表演节目、帮忙打扫卫生，传递爱心与温暖。可获得志愿服务时长认证。',
      requiresApproval: true,
      createdAt: yesterday.toISOString(),
    },
    {
      id: '5',
      title: '摄影基础入门工作坊',
      type: 'lecture',
      location: '美术楼201教室',
      startTime: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(tomorrow.getTime() + 16 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 30,
      fee: 0,
      bringItems: '相机或手机',
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=photography%20workshop%20classroom%20with%20cameras%20and%20students%20learning%20professional%20lighting%20setup&image_size=landscape_16_9',
      description: '从零开始学习摄影基础知识，包括光圈、快门、ISO的关系，以及构图入门技巧。',
      requiresApproval: false,
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      id: '6',
      title: '校园清洁志愿活动',
      type: 'volunteer',
      location: '学校东门集合',
      startTime: new Date(dayAfter.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(dayAfter.getTime() + 11 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 40,
      fee: 0,
      bringItems: '手套、水杯',
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=campus%20cleanup%20volunteer%20activity%20students%20picking%20up%20litter%20green%20campus%20sunny%20day%20teamwork&image_size=landscape_16_9',
      description: '美化校园环境，清理校园内的垃圾，培养环保意识。提供工具和志愿服务时长。',
      requiresApproval: false,
      createdAt: yesterday.toISOString(),
    },
  ];

  activities = seedActivities;
  activityIdCounter = 7;

  const seedRegistrations: Registration[] = [
    {
      id: '1',
      activityId: '1',
      name: '张三',
      college: '计算机学院',
      phone: '13800138001',
      isFirstTime: false,
      remark: '想了解AI方向',
      status: 'registered',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: twoDaysAgo.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '2',
      activityId: '1',
      name: '李四',
      college: '电子信息学院',
      phone: '13800138002',
      isFirstTime: true,
      remark: '第一次参加讲座',
      status: 'registered',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: twoDaysAgo.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '3',
      activityId: '1',
      name: '王五',
      college: '数学学院',
      phone: '13800138003',
      isFirstTime: false,
      remark: '',
      status: 'registered',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: yesterday.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '4',
      activityId: '2',
      name: '赵六',
      college: '文学院',
      phone: '13800138004',
      isFirstTime: true,
      remark: '喜欢玩狼人杀',
      status: 'registered',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: yesterday.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '5',
      activityId: '2',
      name: '钱七',
      college: '经济学院',
      phone: '13800138005',
      isFirstTime: false,
      remark: '',
      status: 'registered',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: yesterday.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '6',
      activityId: '2',
      name: '孙八',
      college: '法学院',
      phone: '13800138006',
      isFirstTime: true,
      remark: '新手求带',
      status: 'registered',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: yesterday.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '7',
      activityId: '2',
      name: '周九',
      college: '外国语学院',
      phone: '13800138007',
      isFirstTime: false,
      remark: '',
      status: 'waitlist',
      checkInStatus: 'pending',
      waitlistPosition: 1,
      createdAt: yesterday.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '8',
      activityId: '2',
      name: '吴十',
      college: '艺术学院',
      phone: '13800138008',
      isFirstTime: true,
      remark: '',
      status: 'waitlist',
      checkInStatus: 'pending',
      waitlistPosition: 2,
      createdAt: yesterday.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '9',
      activityId: '3',
      name: '郑十一',
      college: '新闻传播学院',
      phone: '13800138009',
      isFirstTime: false,
      remark: '有单反相机',
      status: 'registered',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: twoDaysAgo.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '10',
      activityId: '3',
      name: '王十二',
      college: '美术学院',
      phone: '13800138010',
      isFirstTime: true,
      remark: '新手入门',
      status: 'registered',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: twoDaysAgo.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '11',
      activityId: '4',
      name: '李十三',
      college: '社会学院',
      phone: '13800138011',
      isFirstTime: false,
      remark: '想多参与志愿活动',
      status: 'registered',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: yesterday.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '12',
      activityId: '4',
      name: '张十四',
      college: '护理学院',
      phone: '13800138012',
      isFirstTime: true,
      remark: '',
      status: 'registered',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: yesterday.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '13',
      activityId: '5',
      name: '刘十五',
      college: '设计学院',
      phone: '13800138013',
      isFirstTime: false,
      remark: '',
      status: 'registered',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: yesterday.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '14',
      activityId: '6',
      name: '陈十六',
      college: '环境学院',
      phone: '13800138014',
      isFirstTime: true,
      remark: '环保爱好者',
      status: 'registered',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: yesterday.toISOString(),
      promotedFromWaitlist: false,
    },
    {
      id: '15',
      activityId: '1',
      name: '林十七',
      college: '自动化学院',
      phone: '13800138015',
      isFirstTime: false,
      remark: '',
      status: 'cancelled',
      checkInStatus: 'pending',
      waitlistPosition: 0,
      createdAt: twoDaysAgo.toISOString(),
      promotedFromWaitlist: false,
    },
  ];

  registrations = seedRegistrations;
  registrationIdCounter = 16;
};
