import type { Sample, ShipmentOrder, InventoryLog, ExpressCompany } from './types';
import { subDays, format, addDays } from 'date-fns';

const expressCompanies: ExpressCompany[] = ['sf', 'jd', 'yt', 'zt', 'yd', 'ems', 'other'];
const customerNames = ['华为技术有限公司', '小米科技有限公司', '阿里巴巴集团', '腾讯科技', '字节跳动', '京东集团', '美团点评', '百度在线', '网易公司', '滴滴出行'];
const contactPersons = ['张经理', '李主管', '王工程师', '刘采购', '陈总监', '杨专员', '黄助理', '周组长', '吴经理', '郑主管'];
const senders = ['张三', '李四', '王五', '赵六', '钱七'];
const sampleCategories = ['电子元器件', '包装材料', '成品样品', '零部件', '原材料'];
const units = ['个', '件', '套', '箱', '千克'];

const sampleNames = [
  { name: '芯片模块X1', category: '电子元器件', unit: '个' },
  { name: '蓝牙模块B2', category: '电子元器件', unit: '个' },
  { name: '传感器S3', category: '电子元器件', unit: '个' },
  { name: '控制器C4', category: '电子元器件', unit: '个' },
  { name: '电源适配器P5', category: '电子元器件', unit: '个' },
  { name: '彩盒包装A1', category: '包装材料', unit: '个' },
  { name: '礼品盒B2', category: '包装材料', unit: '个' },
  { name: '纸箱C3', category: '包装材料', unit: '个' },
  { name: '缓冲材料D4', category: '包装材料', unit: '千克' },
  { name: '说明书E5', category: '包装材料', unit: '份' },
  { name: '智能手环Pro', category: '成品样品', unit: '件' },
  { name: '蓝牙耳机Max', category: '成品样品', unit: '件' },
  { name: '无线充电器', category: '成品样品', unit: '件' },
  { name: '移动电源20000mAh', category: '成品样品', unit: '件' },
  { name: '智能音箱Mini', category: '成品样品', unit: '件' },
  { name: '精密齿轮组', category: '零部件', unit: '套' },
  { name: '不锈钢外壳', category: '零部件', unit: '个' },
  { name: 'PCB板A型', category: '零部件', unit: '块' },
  { name: '塑料外壳B款', category: '零部件', unit: '个' },
  { name: '连接线束', category: '零部件', unit: '条' },
];

const generateId = () => Math.random().toString(36).substring(2, 15);

export const generateMockSamples = (): Sample[] => {
  return sampleNames.map((item, index) => ({
    id: `sample-${index + 1}`,
    name: item.name,
    sku: `SKU${String(index + 1).padStart(4, '0')}`,
    category: item.category,
    batch: `BATCH-${2024}${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`,
    stockQuantity: Math.floor(Math.random() * 200) + 20,
    warningThreshold: 20,
    unit: item.unit,
    description: `${item.name}标准规格产品`,
    createdAt: format(subDays(new Date(), Math.random() * 100), 'yyyy-MM-dd HH:mm:ss'),
    updatedAt: format(subDays(new Date(), Math.random() * 30), 'yyyy-MM-dd HH:mm:ss'),
  }));
};

export const generateMockShipmentOrders = (samples: Sample[]): ShipmentOrder[] => {
  const orders: ShipmentOrder[] = [];
  const statuses: Array<'pending' | 'shipping' | 'delivered' | 'followup'> = ['pending', 'shipping', 'delivered', 'followup'];
  
  for (let i = 0; i < 35; i++) {
    const sample = samples[Math.floor(Math.random() * samples.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const createDate = subDays(new Date(), daysAgo);
    const sendDate = status !== 'pending' ? subDays(createDate, Math.floor(Math.random() * 2)) : null;
    const expectedDate = sendDate ? addDays(sendDate, 3 + Math.floor(Math.random() * 3)) : null;
    const actualDate = status === 'delivered' || status === 'followup' 
      ? expectedDate ? addDays(expectedDate, Math.floor(Math.random() * 3) - 1) : null 
      : null;
    
    orders.push({
      id: `order-${i + 1}`,
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      contactPerson: contactPersons[Math.floor(Math.random() * contactPersons.length)],
      contactPhone: `1${3 + Math.floor(Math.random() * 6)}${String(Math.random()).slice(2, 11)}`,
      customerAddress: '北京市朝阳区某某街道某某大厦',
      sampleId: sample.id,
      sampleName: sample.name,
      quantity: Math.floor(Math.random() * 10) + 1,
      batch: sample.batch,
      expressCompany: expressCompanies[Math.floor(Math.random() * expressCompanies.length)],
      trackingNumber: status !== 'pending' 
        ? `${['SF', 'JD', 'YT', 'ZT', 'YD', 'EMS', 'OTH'][Math.floor(Math.random() * 7)]}${String(Math.random()).slice(2, 14)}`
        : '',
      sender: senders[Math.floor(Math.random() * senders.length)],
      sendDate: sendDate ? format(sendDate, 'yyyy-MM-dd') : null,
      expectedArrivalDate: expectedDate ? format(expectedDate, 'yyyy-MM-dd') : null,
      actualArrivalDate: actualDate ? format(actualDate, 'yyyy-MM-dd') : null,
      status,
      feedback: (status === 'delivered' || status === 'followup') && Math.random() > 0.3
        ? ['客户对样品质量满意，考虑批量采购', '样品测试通过，待确认价格', '需要调整部分参数后再评估', '客户反馈样品规格不符合需求，已建议其他型号', ''][Math.floor(Math.random() * 5)]
        : '',
      needReissue: status === 'delivered' && Math.random() > 0.8,
      convertedToOrder: status === 'delivered' && Math.random() > 0.6,
      reissueOrderId: null,
      remarks: '',
      createdAt: format(createDate, 'yyyy-MM-dd HH:mm:ss'),
      updatedAt: format(createDate, 'yyyy-MM-dd HH:mm:ss'),
    });
  }
  
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const generateMockInventoryLogs = (samples: Sample[], orders: ShipmentOrder[]): InventoryLog[] => {
  const logs: InventoryLog[] = [];
  let logId = 1;
  
  samples.forEach((sample) => {
    logs.push({
      id: `log-${logId++}`,
      sampleId: sample.id,
      shipmentOrderId: null,
      operationType: 'in',
      quantityChange: sample.stockQuantity + Math.floor(Math.random() * 100),
      balanceAfter: sample.stockQuantity,
      operator: '系统初始化',
      remark: '初始库存入库',
      createdAt: sample.createdAt,
    });
  });
  
  orders.filter(o => o.status !== 'pending').forEach((order) => {
    const sample = samples.find(s => s.id === order.sampleId);
    if (sample) {
      logs.push({
        id: `log-${logId++}`,
        sampleId: order.sampleId,
        shipmentOrderId: order.id,
        operationType: 'out',
        quantityChange: -order.quantity,
        balanceAfter: Math.max(0, sample.stockQuantity - order.quantity),
        operator: order.sender,
        remark: `寄样单出库: ${order.customerName}`,
        createdAt: order.sendDate ? `${order.sendDate} 09:00:00` : order.createdAt,
      });
    }
  });
  
  for (let i = 0; i < 10; i++) {
    const sample = samples[Math.floor(Math.random() * samples.length)];
    const quantity = Math.floor(Math.random() * 50) + 10;
    logs.push({
      id: `log-${logId++}`,
      sampleId: sample.id,
      shipmentOrderId: null,
      operationType: 'in',
      quantityChange: quantity,
      balanceAfter: sample.stockQuantity + quantity,
      operator: senders[Math.floor(Math.random() * senders.length)],
      remark: '补充库存入库',
      createdAt: format(subDays(new Date(), Math.random() * 20), 'yyyy-MM-dd HH:mm:ss'),
    });
  }
  
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
