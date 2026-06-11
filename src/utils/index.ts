export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

export const getTodayStr = (): string => {
  return formatDate(new Date().toISOString());
};

export const daysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export const speciesLabel: Record<string, string> = {
  dog: '狗狗',
  cat: '猫咪',
  other: '其他',
};

export const statusLabel: Record<string, string> = {
  pending: '待开始',
  active: '进行中',
  completed: '已结束',
};

export const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-600',
};

export const checkInItemTypeLabel: Record<string, string> = {
  feeding: '喂食',
  medication: '喂药',
  walking: '遛弯',
  other: '其他',
};

export const checkInItemTypeIcon: Record<string, string> = {
  feeding: '🍚',
  medication: '💊',
  walking: '🐾',
  other: '📝',
};

export const handleFileUpload = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const exportReviewHTML = (params: {
  petName: string;
  species: string;
  breed: string;
  age: number;
  allergies: string;
  taskTitle: string;
  startDate: string;
  endDate: string;
  caretakerName: string;
  totalDays: number;
  completedCheckins: number;
  completionRate: number;
  missedFeedings: number;
  missedMedications: number;
  anomalyRecords: { date: string; description: string }[];
  initialFoodAmount: number;
  consumedFoodAmount: number;
  remainingFoodAmount: number;
  foodUnit: string;
  suppliesToBuy: string[];
  photos: { url: string; caption: string }[];
}) => {
  const p = params;
  const speciesEmoji = p.species === 'dog' ? '🐕' : p.species === 'cat' ? '🐱' : '🐾';

  const anomalyRows = p.anomalyRecords.length > 0
    ? p.anomalyRecords.map((r) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#991b1b">${r.date}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#b91c1c">${r.description || '未描述'}</td>
        </tr>`).join('')
    : '<tr><td colspan="2" style="padding:20px;text-align:center;color:#6b7280">寄养期间一切正常，无异常记录</td></tr>';

  const supplyRows = p.suppliesToBuy.length > 0
    ? p.suppliesToBuy.map((item, i) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#92400e;font-weight:600">${i + 1}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#b45309">${item}</td>
        </tr>`).join('')
    : '<tr><td colspan="2" style="padding:20px;text-align:center;color:#6b7280">暂无需要补充的物资</td></tr>';

  const photoCards = p.photos.length > 0
    ? p.photos.map((photo) => `
        <div style="break-inside:avoid;margin-bottom:12px">
          <img src="${photo.url}" alt="${photo.caption || '打卡照片'}" style="width:100%;border-radius:12px;border:1px solid #e5e7eb;display:block" />
          ${photo.caption ? `<p style="font-size:12px;color:#6b7280;margin-top:4px;text-align:center">${photo.caption}</p>` : ''}
        </div>`).join('')
    : '<p style="color:#6b7280;text-align:center;padding:20px">暂无打卡照片</p>';

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>交接回顾 - ${p.petName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fffbf0; color: #1e293b; line-height: 1.6; padding: 24px; }
  .container { max-width: 800px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border-radius: 20px; padding: 32px; margin-bottom: 24px; }
  .header h1 { font-size: 28px; margin-bottom: 4px; }
  .header .subtitle { opacity: 0.9; font-size: 15px; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .stat-card { background: white; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .stat-card .number { font-size: 32px; font-weight: 800; color: #d97706; }
  .stat-card .label { font-size: 13px; color: #64748b; margin-top: 4px; }
  .section { background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .section h2 { font-size: 18px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  table { width: 100%; border-collapse: collapse; }
  .info-row { display: flex; justify-content: space-between; padding: 10px 14px; border-radius: 10px; margin-bottom: 8px; }
  .info-row.bg-emerald { background: #ecfdf5; }
  .info-row.bg-amber { background: #fffbeb; }
  .info-row .label { color: #64748b; }
  .info-row .value { font-weight: 600; }
  .alert { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 18px; margin-bottom: 12px; color: #991b1b; }
  .progress-bar { height: 10px; background: #f1f5f9; border-radius: 999px; overflow: hidden; margin: 8px 0; }
  .progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #f59e0b, #d97706); }
  .photos-grid { columns: 3; column-gap: 12px; }
  @media (max-width: 640px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
    .photos-grid { columns: 2; }
  }
  @media print { body { padding: 0; background: white; } .section { box-shadow: none; border: 1px solid #e5e7eb; } }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>${speciesEmoji} ${p.petName} 的交接回顾</h1>
    <div class="subtitle">${p.taskTitle}${p.caretakerName ? ` · 照料人：${p.caretakerName}` : ''}</div>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="number">${p.totalDays}</div>
      <div class="label">寄养天数</div>
    </div>
    <div class="stat-card">
      <div class="number">${p.completedCheckins}</div>
      <div class="label">打卡天数</div>
    </div>
    <div class="stat-card">
      <div class="number">${p.completionRate}%</div>
      <div class="label">完成率</div>
    </div>
    <div class="stat-card">
      <div class="number">${p.photos.length}</div>
      <div class="label">照片记录</div>
    </div>
  </div>

  <div class="section">
    <h2>🐾 宠物信息</h2>
    <div class="info-row bg-amber">
      <span class="label">名字</span>
      <span class="value">${p.petName}</span>
    </div>
    <div class="info-row">
      <span class="label">品种</span>
      <span class="value">${p.breed || '未填写'}</span>
    </div>
    <div class="info-row">
      <span class="label">年龄</span>
      <span class="value">${p.age} 岁</span>
    </div>
    ${p.allergies ? `<div class="alert">⚠️ 过敏禁忌：${p.allergies}</div>` : ''}
  </div>

  <div class="section">
    <h2>📅 寄养时间</h2>
    <div class="info-row bg-emerald">
      <span class="label">开始日期</span>
      <span class="value" style="color:#059669">${p.startDate}</span>
    </div>
    <div class="info-row">
      <span class="label">结束日期</span>
      <span class="value">${p.endDate}</span>
    </div>
    <div class="info-row bg-amber">
      <span class="label">实际打卡</span>
      <span class="value" style="color:#d97706">${p.completedCheckins} / ${p.totalDays} 天</span>
    </div>
  </div>

  <div class="section">
    <h2>📦 粮食物资</h2>
    <div class="info-row">
      <span class="label">初始量</span>
      <span class="value">${p.initialFoodAmount} ${p.foodUnit}</span>
    </div>
    <div class="info-row">
      <span class="label">已消耗</span>
      <span class="value" style="color:#d97706">${p.consumedFoodAmount.toFixed(1)} ${p.foodUnit}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${p.initialFoodAmount > 0 ? (p.consumedFoodAmount / p.initialFoodAmount) * 100 : 0}%"></div>
    </div>
    <div class="info-row bg-emerald">
      <span class="label">剩余量</span>
      <span class="value" style="color:#059669;font-size:18px">${p.remainingFoodAmount.toFixed(1)} ${p.foodUnit}</span>
    </div>
  </div>

  <div class="section">
    <h2>${p.missedFeedings > 0 || p.missedMedications > 0 ? '⚠️' : '✅'} 任务完成情况</h2>
    <div class="info-row">
      <span class="label">🍚 漏喂次数</span>
      <span class="value" style="color:${p.missedFeedings > 0 ? '#dc2626' : '#059669'}">${p.missedFeedings > 0 ? p.missedFeedings + ' 次' : '无'}</span>
    </div>
    <div class="info-row">
      <span class="label">💊 漏药次数</span>
      <span class="value" style="color:${p.missedMedications > 0 ? '#dc2626' : '#059669'}">${p.missedMedications > 0 ? p.missedMedications + ' 次' : '无'}</span>
    </div>
  </div>

  <div class="section">
    <h2>🚨 异常记录</h2>
    <table>
      <thead>
        <tr style="background:#fef2f2">
          <th style="padding:10px 14px;text-align:left;border-bottom:2px solid #fecaca;color:#991b1b">日期</th>
          <th style="padding:10px 14px;text-align:left;border-bottom:2px solid #fecaca;color:#991b1b">异常描述</th>
        </tr>
      </thead>
      <tbody>${anomalyRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>🛒 建议补充清单</h2>
    <table>
      <thead>
        <tr style="background:#fffbeb">
          <th style="padding:10px 14px;text-align:left;border-bottom:2px solid #fde68a;color:#92400e;width:60px">序号</th>
          <th style="padding:10px 14px;text-align:left;border-bottom:2px solid #fde68a;color:#92400e">物品</th>
        </tr>
      </thead>
      <tbody>${supplyRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>📷 打卡照片</h2>
    <div class="photos-grid">${photoCards}</div>
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `交接回顾-${p.petName}-${p.startDate}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
