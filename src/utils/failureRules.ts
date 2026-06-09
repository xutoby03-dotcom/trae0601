import type { ProblemTag, BakingRecord } from '@/types'

interface FailureCause {
  reason: string
  suggestion: string
  confidence: 'high' | 'medium' | 'low'
}

const RULES: Record<ProblemTag, (record: Partial<BakingRecord>) => FailureCause[]> = {
  cracking: (r) => {
    const causes: FailureCause[] = []
    if (r.ovenTemp && r.ovenTemp > 180) {
      causes.push({ reason: '烤箱温度过高', suggestion: `当前${r.ovenTemp}℃，建议降低10-15℃，先用高温定型再降温烘烤`, confidence: 'high' })
    }
    if (r.productType === 'cake') {
      causes.push({ reason: '面糊过度搅拌导致面筋形成', suggestion: '改用切拌法混合，避免画圈搅拌，至无干粉即停', confidence: 'high' })
    }
    causes.push({ reason: '开门过早冷空气涌入', suggestion: '至少前2/3烘烤时间不开炉门，用炉灯观察', confidence: 'medium' })
    if (r.humidity && r.humidity < 30) {
      causes.push({ reason: '环境湿度过低', suggestion: `当前湿度${r.humidity}%，可在烤箱内放一碗热水增加湿度`, confidence: 'low' })
    }
    return causes
  },

  collapsing: (r) => {
    const causes: FailureCause[] = []
    if (r.ovenTemp && r.ovenTemp < 150) {
      causes.push({ reason: '烤箱温度过低，结构未定型', suggestion: `当前${r.ovenTemp}℃，蛋糕类建议至少150℃起烤`, confidence: 'high' })
    }
    if (r.bakeTime && r.bakeTime < 30 && r.productType === 'cake') {
      causes.push({ reason: '烘烤时间不足', suggestion: `当前${r.bakeTime}分钟，蛋糕建议至少烤30-40分钟`, confidence: 'high' })
    }
    causes.push({ reason: '出炉后未倒扣晾凉', suggestion: '戚风蛋糕出炉后立即倒扣，完全冷却再脱模', confidence: 'high' })
    causes.push({ reason: '蛋白打发不足或过度', suggestion: '蛋白打至湿性偏干发泡，提起有小弯钩即可', confidence: 'medium' })
    if (r.flourType === '高筋面粉' && r.productType === 'cake') {
      causes.push({ reason: '使用了高筋面粉', suggestion: '蛋糕应使用低筋面粉，高筋面粉筋度太高会导致结构问题', confidence: 'high' })
    }
    return causes
  },

  undercooked: (r) => {
    const causes: FailureCause[] = []
    if (r.bakeTime && r.bakeTime < 25) {
      causes.push({ reason: '烘烤时间不足', suggestion: `当前${r.bakeTime}分钟，建议延长10-15分钟`, confidence: 'high' })
    }
    if (r.ovenTemp && r.ovenTemp < 160) {
      causes.push({ reason: '烤箱温度偏低', suggestion: `当前${r.ovenTemp}℃，建议提高10-20℃`, confidence: 'high' })
    }
    causes.push({ reason: '烤箱实际温度偏低（温度不准）', suggestion: '建议用烤箱温度计校准实际温度，很多家用烤箱偏低20-30℃', confidence: 'medium' })
    causes.push({ reason: '面糊装模太厚', suggestion: '面糊装6-7分满即可，太厚中间不易熟', confidence: 'medium' })
    return causes
  },

  too_hard: (r) => {
    const causes: FailureCause[] = []
    if (r.productType === 'cookie') {
      causes.push({ reason: '黄油打发过度', suggestion: '饼干黄油只需打至微发即可，过度打发会裹入太多空气', confidence: 'high' })
      causes.push({ reason: '面粉用量过多', suggestion: '减少面粉量5-10%，或增加黄油比例', confidence: 'medium' })
    }
    if (r.productType === 'bread') {
      causes.push({ reason: '揉面过度，面筋太强', suggestion: '揉至扩展阶段即可，不要过度揉制', confidence: 'medium' })
      causes.push({ reason: '发酵不足', suggestion: '确保发酵至2倍大小，用手指按压不回缩', confidence: 'high' })
    }
    if (r.productType === 'cake') {
      causes.push({ reason: '面糊搅拌过度，面筋形成', suggestion: '改用切拌法，轻柔混合至无干粉即停', confidence: 'high' })
    }
    causes.push({ reason: '水分不足', suggestion: '适当增加液体量（牛奶/水）5-10%', confidence: 'medium' })
    return causes
  },

  too_sweet: (r) => {
    const causes: FailureCause[] = []
    causes.push({ reason: '配方糖量过高', suggestion: '下次减少糖量10-20%，注意糖对结构有影响，不宜减太多', confidence: 'high' })
    causes.push({ reason: '使用了甜度更高的代糖或糖浆', suggestion: '蜂蜜/糖浆比白糖甜度高，替换时需减量', confidence: 'medium' })
    causes.push({ reason: '烘焙时间过长导致水分蒸发、甜味浓缩', suggestion: `当前${r.bakeTime}分钟，可尝试缩短3-5分钟`, confidence: 'low' })
    return causes
  },

  burnt_outside_raw_inside: (r) => {
    const causes: FailureCause[] = []
    if (r.ovenTemp && r.ovenTemp > 180) {
      causes.push({ reason: '烤箱温度过高', suggestion: `当前${r.ovenTemp}℃，建议降低15-20℃，延长烘烤时间`, confidence: 'high' })
    }
    causes.push({ reason: '上火过强', suggestion: '表面盖锡纸，或调低上火温度', confidence: 'high' })
    causes.push({ reason: '烤箱温差大，受热不均', suggestion: '中途调转烤盘方向，或使用热风循环模式', confidence: 'medium' })
    causes.push({ reason: '模具颜色太深吸热', suggestion: '浅色模具受热更均匀，深色模具需降低温度', confidence: 'low' })
    return causes
  },

  no_color: (r) => {
    const causes: FailureCause[] = []
    if (r.ovenTemp && r.ovenTemp < 160) {
      causes.push({ reason: '烤箱温度太低', suggestion: `当前${r.ovenTemp}℃，最后5-10分钟提高温度上色`, confidence: 'high' })
    }
    causes.push({ reason: '配方中糖量不足', suggestion: '糖是上色的关键，适量增加糖或刷蛋液', confidence: 'medium' })
    causes.push({ reason: '烘烤时间不足', suggestion: '延长烘烤时间5-10分钟', confidence: 'medium' })
    return causes
  },

  coarse_texture: (r) => {
    const causes: FailureCause[] = []
    if (r.productType === 'cake') {
      causes.push({ reason: '蛋白消泡', suggestion: '混合时用切拌法，快速轻柔，减少消泡', confidence: 'high' })
      causes.push({ reason: '蛋黄糊有颗粒', suggestion: '蛋黄糊过筛一次，确保细腻无颗粒', confidence: 'medium' })
    }
    causes.push({ reason: '搅拌手法不对，面筋形成', suggestion: '使用切拌/翻拌手法，避免画圈搅拌', confidence: 'high' })
    if (r.humidity && r.humidity > 80) {
      causes.push({ reason: '环境湿度过高影响蛋白打发', suggestion: `当前湿度${r.humidity}%，打蛋白前确保容器无水无油`, confidence: 'medium' })
    }
    return causes
  },

  shrinking: (r) => {
    const causes: FailureCause[] = []
    if (r.productType === 'cake') {
      causes.push({ reason: '蛋白打发不足', suggestion: '蛋白打至湿性偏干发泡，提起有直立小弯钩', confidence: 'high' })
      causes.push({ reason: '出炉未倒扣', suggestion: '戚风蛋糕出炉后立即倒扣，至少2小时后再脱模', confidence: 'high' })
    }
    causes.push({ reason: '烘烤时间不足，内部未熟', suggestion: '用牙签插入中心，拔出干净即熟', confidence: 'medium' })
    causes.push({ reason: '出炉后温差过大', suggestion: '可稍微开炉门散热1-2分钟再取出', confidence: 'low' })
    return causes
  },

  demolding_difficulty: (r) => {
    const causes: FailureCause[] = []
    causes.push({ reason: '未完全冷却就脱模', suggestion: '蛋糕至少冷却2小时再脱模，面包冷却至手温', confidence: 'high' })
    causes.push({ reason: '模具未做好防粘处理', suggestion: '涂抹黄油+撒面粉，或使用烘焙纸/硅胶垫', confidence: 'high' })
    causes.push({ reason: '蛋糕体太湿软', suggestion: '检查烘烤时间是否充足，内部是否完全熟透', confidence: 'medium' })
    return causes
  },
}

export function analyzeFailure(
  tags: ProblemTag[],
  record: Partial<BakingRecord>
): Map<ProblemTag, FailureCause[]> {
  const result = new Map<ProblemTag, FailureCause[]>()
  for (const tag of tags) {
    result.set(tag, RULES[tag](record))
  }
  return result
}

export type { FailureCause }
