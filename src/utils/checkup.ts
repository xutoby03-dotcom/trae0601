import { DailyRecord, Braces, Reminder } from '../types';
import { getTodayString, getDaysDiff } from './storage';

export interface CheckupIssue {
  category: 'pain' | 'crack' | 'loose' | 'missed' | 'clean';
  title: string;
  items: string[];
}

export const generateCheckupList = (
  braces: Braces,
  records: DailyRecord[],
  reminders: Reminder[]
): CheckupIssue[] => {
  const today = getTodayString();
  const issues: CheckupIssue[] = [];
  
  const bracesRecords = records
    .filter(r => r.bracesId === braces.id)
    .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
  
  const recentRecords = bracesRecords.filter(r => getDaysDiff(r.recordDate, today) <= 30);
  
  const painRecords = recentRecords.filter(r => r.hasPain);
  if (painRecords.length > 0) {
    issues.push({
      category: 'pain',
      title: '压痛记录 😣',
      items: painRecords.map(r => {
        const location = r.painLocation ? `（${r.painLocation}）` : '';
        return `${r.recordDate}: 有压痛${location}${r.notes ? ` - ${r.notes}` : ''}`;
      }),
    });
  }
  
  const crackRecords = recentRecords.filter(r => r.hasCrack);
  if (crackRecords.length > 0) {
    issues.push({
      category: 'crack',
      title: '裂纹检查 🔍',
      items: crackRecords.map(r => 
        `${r.recordDate}: 发现牙套裂纹${r.notes ? ` - ${r.notes}` : ''}`
      ),
    });
  }
  
  const looseRecords = recentRecords.filter(r => r.isLoose);
  if (looseRecords.length > 0) {
    issues.push({
      category: 'loose',
      title: '松动情况 📏',
      items: looseRecords.map(r => 
        `${r.recordDate}: 感觉牙套松动${r.notes ? ` - ${r.notes}` : ''}`
      ),
    });
  }
  
  const missedWearRecords = recentRecords.filter(r => r.wearHours < 20);
  if (missedWearRecords.length > 0) {
    issues.push({
      category: 'missed',
      title: '漏戴记录 ⏰',
      items: missedWearRecords.map(r => 
        `${r.recordDate}: 仅佩戴${r.wearHours}小时（要求≥20小时）`
      ),
    });
  }
  
  const cleanReminders = reminders.filter(
    r => r.bracesId === braces.id && r.type === 'overdue_clean' && !r.isResolved
  );
  if (cleanReminders.length > 0 || recentRecords.some(r => !r.isBrushed || !r.isSoaked)) {
    const unbrushedDays = recentRecords.filter(r => !r.isBrushed).length;
    const unsoakedDays = recentRecords.filter(r => !r.isSoaked).length;
    issues.push({
      category: 'clean',
      title: '清洁情况 🧼',
      items: [
        `最近30天内有${unbrushedDays}天未刷洗`,
        `最近30天内有${unsoakedDays}天未泡清洁片`,
        ...cleanReminders.map(r => `${r.triggerDate}: ${r.description}`),
      ],
    });
  }
  
  return issues;
};

export const generateCheckupSummary = (
  braces: Braces,
  issues: CheckupIssue[]
): string => {
  const today = new Date().toLocaleDateString('zh-CN');
  let summary = `# ${braces.name} 复诊问题清单\n\n`;
  summary += `生成日期：${today}\n\n`;
  
  if (issues.length === 0) {
    summary += '✅ 最近状况良好，无特殊问题需要向医生说明。\n';
  } else {
    for (const issue of issues) {
      summary += `## ${issue.title}\n\n`;
      for (const item of issue.items) {
        summary += `- [ ] ${item}\n`;
      }
      summary += '\n';
    }
  }
  
  summary += '\n---\n';
  summary += '请携带此清单就诊，与医生沟通以上问题。\n';
  
  return summary;
};

export const getMissedRecordsSummary = (records: DailyRecord[], bracesId: string): string => {
  const today = getTodayString();
  const recentRecords = records
    .filter(r => r.bracesId === bracesId && getDaysDiff(r.recordDate, today) <= 30 && r.wearHours < 20)
    .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
  
  return JSON.stringify(recentRecords.map(r => ({
    date: r.recordDate,
    wearHours: r.wearHours,
    notes: r.notes,
  })));
};
