import type { CleaningRecord, AbnormalType, ObservationNote } from '@/types';
import { ABNORMAL_LABELS } from '@/types';

export function detectAbnormalities(record: Partial<CleaningRecord>): {
  isAbnormal: boolean;
  abnormalTypes: AbnormalType[];
} {
  const abnormalTypes: AbnormalType[] = [];
  
  if (record.hasBloodUrine) abnormalTypes.push('blood_urine');
  if (record.hasAbnormalStool) abnormalTypes.push('abnormal_stool');
  if (record.hasSmallClumps || record.clumpCondition === 'small') {
    abnormalTypes.push('small_clumps');
  }
  if (record.noStoolForDays) abnormalTypes.push('no_stool_days');
  
  return {
    isAbnormal: abnormalTypes.length > 0,
    abnormalTypes,
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function generateObservationNote(
  record: CleaningRecord,
  abnormalType: AbnormalType
): Omit<ObservationNote, 'id' | 'createdAt' | 'updatedAt'> {
  const suggestions: Record<AbnormalType, string> = {
    blood_urine: '血尿可能提示尿路感染、结石或其他泌尿系统问题。建议：增加饮水量，观察后续排尿情况，如持续出现请立即就医。',
    abnormal_stool: '排便异常可能与饮食、消化或肠道健康有关。建议：检查近期饮食变化，观察粪便形态和频率，如持续超过2天请就医。',
    small_clumps: '尿团过小可能意味着饮水量不足或排尿困难。建议：尝试增加湿粮或流动水源，鼓励猫咪多喝水。',
    no_stool_days: '多天未排便可能是便秘的信号。建议：检查猫咪饮食和活动量，可适当增加膳食纤维，如48小时内仍未排便请就医。',
  };
  
  return {
    recordId: record.id,
    catId: record.catId,
    abnormalType,
    content: `检测到【${ABNORMAL_LABELS[abnormalType]}】异常。${suggestions[abnormalType]}`,
    status: 'watching',
    followUpDate: addDays(new Date(), 3).toISOString().split('T')[0],
  };
}

export function generateAllObservationNotes(
  record: CleaningRecord
): Array<Omit<ObservationNote, 'id' | 'createdAt' | 'updatedAt'>> {
  return record.abnormalTypes.map(type => generateObservationNote(record, type));
}
