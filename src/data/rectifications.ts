import { Rectification } from '@/types';

export const mockRectifications: Rectification[] = [
  {
    id: 'rect001',
    deviceId: 'dev002',
    inspectionId: 'ins002',
    type: 'pressure',
    description: '灭火器压力偏低，压力表显示0.9MPa，低于标准值1.0MPa，需要及时充装。',
    status: 'pending',
    createDate: '2026-06-08',
    deadline: '2026-06-18',
    handler: '赵工'
  },
  {
    id: 'rect002',
    deviceId: 'dev004',
    inspectionId: 'ins004',
    type: 'other',
    description: '灭火器压力不足（4.2MPa），喷管老化开裂，前方堆放杂物遮挡设备。',
    status: 'processing',
    createDate: '2026-06-05',
    deadline: '2026-06-15',
    handler: '钱工',
    fixRemark: '已清理杂物，喷管已申请采购中'
  },
  {
    id: 'rect003',
    deviceId: 'dev006',
    inspectionId: 'ins006',
    type: 'other',
    description: '灭火器压力偏低（0.7MPa），铅封损坏，箱门变形无法正常关闭。',
    status: 'closed',
    createDate: '2026-06-07',
    deadline: '2026-06-17',
    handler: '孙工',
    fixPhoto: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fixed%20fire%20extinguisher%20with%20new%20seal%20after%20repair&image_size=square',
    fixDate: '2026-06-12',
    fixRemark: '已完成压力充装，更换铅封，修复箱门'
  },
  {
    id: 'rect004',
    deviceId: 'dev004',
    inspectionId: 'ins011',
    type: 'pressure',
    description: '二氧化碳灭火器压力偏低（4.8MPa），低于标准值5.0MPa。',
    status: 'closed',
    createDate: '2026-05-05',
    deadline: '2026-05-15',
    handler: '钱工',
    fixPhoto: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CO2%20fire%20extinguisher%20after%20refill%20pressure%20gauge&image_size=square',
    fixDate: '2026-05-10',
    fixRemark: '已完成压力充装，压力恢复正常'
  },
  {
    id: 'rect005',
    deviceId: 'dev008',
    inspectionId: 'ins008',
    type: 'expired',
    description: '灭火器即将到期（2026-06-25到期），距离到期不足30天，需安排更换。',
    status: 'pending',
    createDate: '2026-06-03',
    deadline: '2026-06-20',
    handler: '周工'
  }
];
