import type { Exception } from '../types';

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const mockExceptions: Exception[] = [
  {
    id: 'e1',
    type: 'damaged',
    description: '海报右下角被撕破，需要重新张贴',
    location: '一教公告栏A区第3栏',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=damaged%20torn%20poster%20on%20bulletin%20board&image_size=landscape_4_3',
    reporter: '管理员李老师',
    status: 'pending',
    relatedPosterId: 'p1',
    createdAt: addDays(-1),
  },
  {
    id: 'e2',
    type: 'covered',
    description: '海报被新张贴的海报覆盖了一半',
    location: '食堂公告栏第5栏',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=overlapped%20posters%20on%20bulletin%20board%20one%20covering%20another&image_size=landscape_4_3',
    reporter: '学生志愿者小王',
    status: 'processing',
    relatedPosterId: 'p2',
    createdAt: addDays(-2),
  },
  {
    id: 'e3',
    type: 'unauthorized',
    description: '发现未经审批的商业广告海报',
    location: '宿舍区公告栏第2栏',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=unauthorized%20commercial%20ad%20poster%20on%20school%20bulletin%20board&image_size=landscape_4_3',
    reporter: '安保人员',
    status: 'resolved',
    createdAt: addDays(-5),
    resolvedAt: addDays(-3),
  },
  {
    id: 'e4',
    type: 'wrong_position',
    description: '海报贴在了非指定区域的墙面上',
    location: '二教三楼走廊墙面',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=poster%20on%20wrong%20wall%20not%20on%20bulletin%20board&image_size=landscape_4_3',
    reporter: '保洁阿姨',
    status: 'pending',
    createdAt: addDays(0),
  },
  {
    id: 'e5',
    type: 'expired_not_removed',
    description: '活动已结束但海报仍未撤下',
    location: '图书馆公告栏第1栏',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20expired%20poster%20still%20hanging%20on%20bulletin%20board&image_size=landscape_4_3',
    reporter: '管理员李老师',
    status: 'processing',
    relatedPosterId: 'p6',
    createdAt: addDays(-3),
  },
];
