import { Pet, VaccineRecord } from '../../shared/types';
import { addDays, addMonths, formatDate, today, generateId } from '../utils/date';

const T = today();

export const mockPets: Pet[] = [
  {
    id: generateId(),
    name: '豆豆',
    type: 'dog',
    breed: '金毛寻回犬',
    ownerName: '张伟',
    building: '1栋',
    phone: '13800138001',
    photoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20golden%20retriever%20dog%20portrait%20outdoor%20sunny%20day&image_size=square',
    createdAt: formatDate(addDays(T, -180)),
  },
  {
    id: generateId(),
    name: '咪咕',
    type: 'cat',
    breed: '英短蓝猫',
    ownerName: '李娜',
    building: '2栋',
    phone: '13800138002',
    photoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20british%20shorthair%20blue%20cat%20portrait%20sitting%20on%20sofa&image_size=square',
    createdAt: formatDate(addDays(T, -150)),
  },
  {
    id: generateId(),
    name: '旺财',
    type: 'dog',
    breed: '柴犬',
    ownerName: '王强',
    building: '3栋',
    phone: '13800138003',
    photoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=happy%20shiba%20inu%20dog%20portrait%20smile%20outdoor%20grass&image_size=square',
    createdAt: formatDate(addDays(T, -120)),
  },
  {
    id: generateId(),
    name: '雪球',
    type: 'cat',
    breed: '布偶猫',
    ownerName: '赵敏',
    building: '1栋',
    phone: '13800138004',
    photoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fluffy%20ragdoll%20cat%20blue%20eyes%20soft%20portrait%20indoor&image_size=square',
    createdAt: formatDate(addDays(T, -100)),
  },
  {
    id: generateId(),
    name: '小黑',
    type: 'dog',
    breed: '拉布拉多',
    ownerName: '孙磊',
    building: '4栋',
    phone: '13800138005',
    photoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20labrador%20retriever%20dog%20portrait%20friendly&image_size=square',
    createdAt: formatDate(addDays(T, -200)),
  },
  {
    id: generateId(),
    name: '花花',
    type: 'cat',
    breed: '中华田园猫',
    ownerName: '周芳',
    building: '5栋',
    phone: '13800138006',
    photoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=calico%20cat%20portrait%20curious%20looking%20camera&image_size=square',
    createdAt: formatDate(addDays(T, -90)),
  },
  {
    id: generateId(),
    name: '大毛',
    type: 'dog',
    breed: '哈士奇',
    ownerName: '吴斌',
    building: '2栋',
    phone: '13800138007',
    photoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=siberian%20husky%20dog%20blue%20eyes%20funny%20face&image_size=square',
    createdAt: formatDate(addDays(T, -70)),
  },
  {
    id: generateId(),
    name: '咪咪',
    type: 'cat',
    breed: '美短',
    ownerName: '郑丽',
    building: '6栋',
    phone: '13800138008',
    photoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=american%20shorthair%20cat%20tabby%20stripes%20portrait&image_size=square',
    createdAt: formatDate(addDays(T, -60)),
  },
  {
    id: generateId(),
    name: '阿宝',
    type: 'dog',
    breed: '泰迪',
    ownerName: '钱进',
    building: '3栋',
    phone: '13800138009',
    photoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20teddy%20poodle%20dog%20brown%20curly%20fur%20portrait&image_size=square',
    createdAt: formatDate(addDays(T, -40)),
  },
  {
    id: generateId(),
    name: '奶茶',
    type: 'cat',
    breed: '橘猫',
    ownerName: '冯雪',
    building: '4栋',
    phone: '13800138010',
    photoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fat%20orange%20tabby%20cat%20chubby%20sleepy%20cute&image_size=square',
    createdAt: formatDate(addDays(T, -30)),
  },
];

const P = mockPets;

export const mockVaccineRecords: VaccineRecord[] = [
  {
    id: generateId(),
    petId: P[0].id,
    vaccineName: '狂犬疫苗',
    vaccinatedAt: formatDate(addMonths(T, -11)),
    nextDueAt: formatDate(addDays(T, 20)),
    hospital: '爱宠动物医院',
    proofPhotoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20vaccination%20certificate%20document%20with%20stamp&image_size=square',
    remark: '年度加强针',
    createdAt: formatDate(addMonths(T, -11)),
  },
  {
    id: generateId(),
    petId: P[0].id,
    vaccineName: '六联疫苗',
    vaccinatedAt: formatDate(addMonths(T, -6)),
    nextDueAt: formatDate(addDays(T, 180)),
    hospital: '爱宠动物医院',
    proofPhotoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20vaccine%20card%20medical%20record&image_size=square',
    createdAt: formatDate(addMonths(T, -6)),
  },
  {
    id: generateId(),
    petId: P[1].id,
    vaccineName: '猫三联',
    vaccinatedAt: formatDate(addMonths(T, -12)),
    nextDueAt: formatDate(addDays(T, -15)),
    hospital: '瑞鹏宠物医院',
    proofPhotoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cat%20vaccination%20record%20booklet&image_size=square',
    remark: '已过期，需尽快补种',
    createdAt: formatDate(addMonths(T, -12)),
  },
  {
    id: generateId(),
    petId: P[1].id,
    vaccineName: '狂犬疫苗',
    vaccinatedAt: formatDate(addMonths(T, -13)),
    nextDueAt: formatDate(addDays(T, -45)),
    hospital: '瑞鹏宠物医院',
    createdAt: formatDate(addMonths(T, -13)),
  },
  {
    id: generateId(),
    petId: P[2].id,
    vaccineName: '狂犬疫苗',
    vaccinatedAt: formatDate(addMonths(T, -3)),
    nextDueAt: formatDate(addDays(T, 270)),
    hospital: '新瑞鹏',
    proofPhotoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20vaccine%20certificate%20official%20paper&image_size=square',
    createdAt: formatDate(addMonths(T, -3)),
  },
  {
    id: generateId(),
    petId: P[2].id,
    vaccineName: '八联疫苗',
    vaccinatedAt: formatDate(addMonths(T, -5)),
    nextDueAt: formatDate(addDays(T, 210)),
    hospital: '新瑞鹏',
    proofPhotoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20health%20record%20document%20stamped&image_size=square',
    createdAt: formatDate(addMonths(T, -5)),
  },
  {
    id: generateId(),
    petId: P[3].id,
    vaccineName: '猫三联',
    vaccinatedAt: formatDate(addMonths(T, -2)),
    nextDueAt: formatDate(addDays(T, 300)),
    hospital: '芭比堂',
    proofPhotoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ragdoll%20cat%20medical%20record%20vaccination&image_size=square',
    createdAt: formatDate(addMonths(T, -2)),
  },
  {
    id: generateId(),
    petId: P[4].id,
    vaccineName: '狂犬疫苗',
    vaccinatedAt: formatDate(addMonths(T, -8)),
    nextDueAt: formatDate(addDays(T, 120)),
    hospital: '美联众合',
    proofPhotoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20lab%20vaccine%20certificate&image_size=square',
    createdAt: formatDate(addMonths(T, -8)),
  },
  {
    id: generateId(),
    petId: P[4].id,
    vaccineName: '六联疫苗',
    vaccinatedAt: formatDate(addMonths(T, -4)),
    nextDueAt: formatDate(addDays(T, 240)),
    hospital: '美联众合',
    createdAt: formatDate(addMonths(T, -4)),
  },
  {
    id: generateId(),
    petId: P[5].id,
    vaccineName: '猫三联',
    vaccinatedAt: formatDate(addMonths(T, -11)),
    nextDueAt: formatDate(addDays(T, 25)),
    hospital: '瑞派宠物医院',
    proofPhotoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=calico%20cat%20vaccine%20card%20paperwork&image_size=square',
    remark: '月底到期，提前通知业主',
    createdAt: formatDate(addMonths(T, -11)),
  },
  {
    id: generateId(),
    petId: P[6].id,
    vaccineName: '狂犬疫苗',
    vaccinatedAt: formatDate(addMonths(T, -10)),
    nextDueAt: formatDate(addDays(T, 60)),
    hospital: '宠颐生',
    proofPhotoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=husky%20dog%20vaccination%20document%20stamped&image_size=square',
    createdAt: formatDate(addMonths(T, -10)),
  },
  {
    id: generateId(),
    petId: P[6].id,
    vaccineName: '八联疫苗',
    vaccinatedAt: formatDate(addMonths(T, -2)),
    nextDueAt: formatDate(addDays(T, 300)),
    hospital: '宠颐生',
    createdAt: formatDate(addMonths(T, -2)),
  },
  {
    id: generateId(),
    petId: P[7].id,
    vaccineName: '猫三联',
    vaccinatedAt: formatDate(addMonths(T, -1)),
    nextDueAt: formatDate(addDays(T, 330)),
    hospital: '圣宠宠物医院',
    proofPhotoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=american%20shorthair%20cat%20medical%20paperwork&image_size=square',
    createdAt: formatDate(addMonths(T, -1)),
  },
  {
    id: generateId(),
    petId: P[7].id,
    vaccineName: '狂犬疫苗',
    vaccinatedAt: formatDate(addMonths(T, -1)),
    nextDueAt: formatDate(addDays(T, 330)),
    hospital: '圣宠宠物医院',
    createdAt: formatDate(addMonths(T, -1)),
  },
  {
    id: generateId(),
    petId: P[8].id,
    vaccineName: '狂犬疫苗',
    vaccinatedAt: formatDate(addDays(T, -10)),
    nextDueAt: formatDate(addDays(T, 355)),
    hospital: '悦宠动物医院',
    proofPhotoUrl:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=teddy%20poodle%20vaccine%20certificate%20stamp&image_size=square',
    remark: '新补疫苗，刚登记',
    createdAt: formatDate(addDays(T, -10)),
  },
];
