import { Router } from 'express';
import { store } from '../store';
import type { DashboardData } from '../../shared/types';

const router = Router();

const getWeatherBackup = (weather: string): string => {
  if (weather.includes('雨')) {
    return '雨天方案：活动移至社区文化活动中心室内大厅，可容纳80人；启用备用折叠椅50张。';
  }
  if (weather.includes('高温') || parseInt(weather) >= 32) {
    return '高温方案：放映时间推迟至20:00；增设遮阳棚和降温喷雾点；免费提供绿豆汤和冰水。';
  }
  if (weather.includes('大风')) {
    return '大风方案：加固银幕支架，移除轻质道具；野餐垫区域调整至背风草坪区。';
  }
  return '天气良好：按原计划执行，现场备有饮用水和急救箱。';
};

router.get('/:sessionId', (req, res) => {
  const session = store.getSession(req.params.sessionId);
  if (!session) {
    res.status(404).json({ error: '场次不存在' });
    return;
  }

  const registrations = store.getRegistrations(session.id);
  const validRegs = registrations.filter(r => r.status !== 'released');

  const totalRegistered = validRegs.reduce((sum, r) => sum + r.peopleCount, 0);
  const checkedInRegs = validRegs.filter(r => r.status === 'checked_in');
  const checkedIn = checkedInRegs.reduce((sum, r) => sum + r.peopleCount, 0);
  const notCheckedIn = totalRegistered - checkedIn;

  const elderlyDemands = validRegs.reduce((sum, r) => sum + r.elderlyCount, 0);
  const childDemands = validRegs.reduce((sum, r) => sum + r.childCount, 0);
  const wheelchairDemands = validRegs.filter(r => r.needWheelchair).length;

  const inventory = store.getInventory();
  const inventoryGaps = [
    {
      type: 'folding',
      name: '折叠椅',
      needed: Math.max(0, totalRegistered - childDemands - wheelchairDemands * 2),
      available: inventory.find(i => i.type === 'folding')?.total ?? 0,
      gap: 0,
    },
    {
      type: 'child',
      name: '儿童椅',
      needed: childDemands,
      available: inventory.find(i => i.type === 'child')?.total ?? 0,
      gap: 0,
    },
    {
      type: 'wheelchair',
      name: '轮椅位',
      needed: wheelchairDemands,
      available: inventory.find(i => i.type === 'wheelchair')?.total ?? 0,
      gap: 0,
    },
    {
      type: 'picnic',
      name: '野餐垫',
      needed: Math.ceil(totalRegistered / 4),
      available: inventory.find(i => i.type === 'picnic')?.total ?? 0,
      gap: 0,
    },
  ].map(item => ({
    ...item,
    gap: Math.max(0, item.needed - item.available),
  }));

  const data: DashboardData = {
    totalRegistered,
    checkedIn,
    notCheckedIn,
    elderlyDemands,
    childDemands,
    wheelchairDemands,
    inventoryGaps,
    weatherBackup: getWeatherBackup(session.weather),
    weather: session.weather,
  };

  res.json(data);
});

export default router;
