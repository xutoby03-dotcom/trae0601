import type { ExpressCompany } from '@/store/types';

export const expressCompanyMap: Record<ExpressCompany, { name: string; color: string }> = {
  sf: { name: '顺丰速运', color: '#000000' },
  jd: { name: '京东物流', color: '#e4393c' },
  yt: { name: '圆通速递', color: '#781c1c' },
  zt: { name: '中通快递', color: '#0066b3' },
  yd: { name: '韵达快递', color: '#0056b3' },
  ems: { name: 'EMS', color: '#00885a' },
  other: { name: '其他', color: '#6b7280' },
};

export const getExpressCompanyName = (company: ExpressCompany): string => {
  return expressCompanyMap[company]?.name || '未知';
};

export const getExpressCompanyColor = (company: ExpressCompany): string => {
  return expressCompanyMap[company]?.color || '#6b7280';
};

export const expressCompanyOptions = Object.entries(expressCompanyMap).map(([value, { name }]) => ({
  value: value as ExpressCompany,
  label: name,
}));
