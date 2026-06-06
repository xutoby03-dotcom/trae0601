import { TarotCard } from '@/types';

const majorArcana: TarotCard[] = [
  {
    id: 0,
    name: '愚者',
    nameEn: 'The Fool',
    type: 'major',
    image: '🃏',
    meaning: {
      upright: '新的开始、冒险、天真、自由、自发性。愚者代表着生命的无限可能性，鼓励你勇敢迈出第一步，相信自己的直觉。',
      reversed: '鲁莽、冒险带来的风险、天真过度、不切实际。提示你需要更加谨慎，三思而后行。'
    },
    keywords: {
      upright: ['新开始', '冒险', '天真', '自由'],
      reversed: ['鲁莽', '风险', '不切实际']
    }
  },
  {
    id: 1,
    name: '魔术师',
    nameEn: 'The Magician',
    type: 'major',
    image: '🎭',
    meaning: {
      upright: '创造力、技能、意志力、行动力、潜能。你拥有实现目标所需的一切资源和能力，现在是采取行动的时机。',
      reversed: '技能未发挥、欺骗、操纵、意志力薄弱。提醒你要警惕欺骗，包括自欺欺人。'
    },
    keywords: {
      upright: ['创造力', '技能', '意志力', '行动'],
      reversed: ['欺骗', '操纵', '潜能未发挥']
    }
  },
  {
    id: 2,
    name: '女祭司',
    nameEn: 'The High Priestess',
    type: 'major',
    image: '🌙',
    meaning: {
      upright: '直觉、潜意识、神秘、智慧、内在知识。相信你的直觉，答案就在你内心深处。保持静默，倾听内心的声音。',
      reversed: '隐藏的真相、忽视直觉、肤浅认知。提示你需要更加深入地探索，不要只看表面。'
    },
    keywords: {
      upright: ['直觉', '潜意识', '神秘', '智慧'],
      reversed: ['忽视直觉', '肤浅', '隐藏真相']
    }
  },
  {
    id: 3,
    name: '女皇',
    nameEn: 'The Empress',
    type: 'major',
    image: '👑',
    meaning: {
      upright: '丰饶、母性、创造力、自然、感官享受。象征着生命的孕育与成长，是时候滋养你的创意和计划了。',
      reversed: '创意受阻、依赖、空虚、与自然脱节。提醒你要 reconnect 自己的身体和自然。'
    },
    keywords: {
      upright: ['丰饶', '母性', '创造力', '自然'],
      reversed: ['创意受阻', '依赖', '空虚']
    }
  },
  {
    id: 4,
    name: '皇帝',
    nameEn: 'The Emperor',
    type: 'major',
    image: '🏛️',
    meaning: {
      upright: '权威、结构、控制、父性、稳定。建立稳固的基础，运用理性和纪律来实现你的目标。',
      reversed: '过度控制、专制、僵化、缺乏纪律。提醒你要检查是否过于固执或控制欲过强。'
    },
    keywords: {
      upright: ['权威', '结构', '稳定', '纪律'],
      reversed: ['专制', '僵化', '过度控制']
    }
  },
  {
    id: 5,
    name: '教皇',
    nameEn: 'The Hierophant',
    type: 'major',
    image: '⛪',
    meaning: {
      upright: '传统、信仰、精神指引、教育、遵从。寻求智慧的指引，遵循已验证的道路和价值观。',
      reversed: '挑战传统、非传统方法、反叛、新的信仰。可能是时候打破常规，寻找自己的道路。'
    },
    keywords: {
      upright: ['传统', '信仰', '指引', '教育'],
      reversed: ['反叛', '非传统', '挑战权威']
    }
  },
  {
    id: 6,
    name: '恋人',
    nameEn: 'The Lovers',
    type: 'major',
    image: '💝',
    meaning: {
      upright: '爱情、和谐、关系、价值观的选择、结合。象征着深刻的连接，无论是爱情还是重要的人生选择。',
      reversed: '不和谐、失衡、错误的价值观、关系冲突。需要重新审视关系中的价值观和沟通。'
    },
    keywords: {
      upright: ['爱情', '和谐', '选择', '结合'],
      reversed: ['不和谐', '冲突', '价值观失衡']
    }
  },
  {
    id: 7,
    name: '战车',
    nameEn: 'The Chariot',
    type: 'major',
    image: '🛡️',
    meaning: {
      upright: '胜利、意志力、决心、掌控、前进。你有足够的力量和决心克服困难，朝着目标前进。',
      reversed: '失控、缺乏方向、攻击性、失败。提醒你要检查是否失去了掌控，需要调整方向。'
    },
    keywords: {
      upright: ['胜利', '意志力', '决心', '前进'],
      reversed: ['失控', '迷失方向', '攻击性']
    }
  },
  {
    id: 8,
    name: '力量',
    nameEn: 'Strength',
    type: 'major',
    image: '🦁',
    meaning: {
      upright: '内在力量、勇气、耐心、慈悲、影响力。真正的力量来自内心的平静和慈悲，而非蛮力。',
      reversed: '自我怀疑、软弱、不安全感、压抑情绪。需要重新连接你的内在力量和自信。'
    },
    keywords: {
      upright: ['内在力量', '勇气', '耐心', '慈悲'],
      reversed: ['自我怀疑', '软弱', '不安全感']
    }
  },
  {
    id: 9,
    name: '隐士',
    nameEn: 'The Hermit',
    type: 'major',
    image: '🏮',
    meaning: {
      upright: '内省、独处、智慧、寻求真理、引导。是时候退隐反思，在独处中寻找内心的答案和智慧。',
      reversed: '孤立、孤独、拒绝帮助、迷失方向。注意不要过度孤僻，适时寻求他人的帮助。'
    },
    keywords: {
      upright: ['内省', '独处', '智慧', '寻求真理'],
      reversed: ['孤立', '孤独', '迷失']
    }
  },
  {
    id: 10,
    name: '命运之轮',
    nameEn: 'Wheel of Fortune',
    type: 'major',
    image: '🎡',
    meaning: {
      upright: '命运的转折、机会、循环、因果、命运。生命的轮子正在转动，新的机遇和变化即将到来。',
      reversed: '厄运、抵抗变化、打破循环、坏运气。可能正经历低谷，但记住轮子还会继续转动。'
    },
    keywords: {
      upright: ['转折', '机会', '循环', '命运'],
      reversed: ['厄运', '抵抗变化', '坏运气']
    }
  },
  {
    id: 11,
    name: '正义',
    nameEn: 'Justice',
    type: 'major',
    image: '⚖️',
    meaning: {
      upright: '公正、真理、因果、法律、责任。你的行为将带来相应的结果，诚实地面对自己和他人。',
      reversed: '不公正、逃避责任、不诚实、不公平。提醒你要检查是否有不公或逃避责任的情况。'
    },
    keywords: {
      upright: ['公正', '真理', '因果', '责任'],
      reversed: ['不公', '逃避', '不诚实']
    }
  },
  {
    id: 12,
    name: '倒吊人',
    nameEn: 'The Hanged Man',
    type: 'major',
    image: '🔮',
    meaning: {
      upright: '暂停、投降、新视角、牺牲、等待。有时候需要停下脚步，从不同的角度看待问题。',
      reversed: '拖延、无谓的牺牲、抗拒改变、 stagnation。是时候停止拖延，采取行动了。'
    },
    keywords: {
      upright: ['暂停', '新视角', '牺牲', '等待'],
      reversed: ['拖延', '抗拒', '停滞']
    }
  },
  {
    id: 13,
    name: '死神',
    nameEn: 'Death',
    type: 'major',
    image: '💀',
    meaning: {
      upright: '结束、转变、重生、过渡、新开始。一个章节的结束意味着新的开始，拥抱必要的改变。',
      reversed: '抵抗改变、无法放下、停滞、恐惧转变。需要学会放手，接受生活中的变化。'
    },
    keywords: {
      upright: ['结束', '转变', '重生', '新开始'],
      reversed: ['抵抗改变', '无法放下', '恐惧']
    }
  },
  {
    id: 14,
    name: '节制',
    nameEn: 'Temperance',
    type: 'major',
    image: '⚗️',
    meaning: {
      upright: '平衡、适度、耐心、调和、自我控制。找到生活中的平衡点，以温和的方式调和不同的元素。',
      reversed: '失衡、过度、缺乏远见、冲突。需要重新评估生活中的各个方面，恢复平衡。'
    },
    keywords: {
      upright: ['平衡', '适度', '耐心', '调和'],
      reversed: ['失衡', '过度', '冲突']
    }
  },
  {
    id: 15,
    name: '恶魔',
    nameEn: 'The Devil',
    type: 'major',
    image: '😈',
    meaning: {
      upright: '束缚、物质主义、诱惑、成瘾、阴影面。你可能被某些事物所束缚，需要认识到自己的力量来解脱。',
      reversed: '解脱、觉醒、打破束缚、面对阴影。是时候摆脱限制，重新掌控自己的生活。'
    },
    keywords: {
      upright: ['束缚', '诱惑', '物质主义', '成瘾'],
      reversed: ['解脱', '觉醒', '打破束缚']
    }
  },
  {
    id: 16,
    name: '塔',
    nameEn: 'The Tower',
    type: 'major',
    image: '🗼',
    meaning: {
      upright: '突变、混乱、启示、破坏、觉醒。突然的变化虽然令人不安，但会带来真相和新的开始。',
      reversed: '避免灾难、恐惧改变、延迟的破坏。试图避免不可避免的变化，但这只会延长痛苦。'
    },
    keywords: {
      upright: ['突变', '混乱', '启示', '破坏'],
      reversed: ['避免变化', '恐惧', '延迟']
    }
  },
  {
    id: 17,
    name: '星星',
    nameEn: 'The Star',
    type: 'major',
    image: '⭐',
    meaning: {
      upright: '希望、灵感、疗愈、平静、信心。经历困难后，希望和灵感重新出现，保持信心。',
      reversed: '失望、缺乏灵感、信心不足、抑郁。需要重新连接内心的希望和梦想。'
    },
    keywords: {
      upright: ['希望', '灵感', '疗愈', '信心'],
      reversed: ['失望', '缺乏信心', '抑郁']
    }
  },
  {
    id: 18,
    name: '月亮',
    nameEn: 'The Moon',
    type: 'major',
    image: '🌕',
    meaning: {
      upright: '幻觉、恐惧、潜意识、直觉、神秘。事情可能不像表面看起来那样，相信你的直觉，警惕错觉。',
      reversed: '释放恐惧、真相大白、克服焦虑、清晰。迷雾正在消散，真相逐渐显现。'
    },
    keywords: {
      upright: ['幻觉', '恐惧', '潜意识', '直觉'],
      reversed: ['释放恐惧', '真相', '清晰']
    }
  },
  {
    id: 19,
    name: '太阳',
    nameEn: 'The Sun',
    type: 'major',
    image: '☀️',
    meaning: {
      upright: '成功、快乐、活力、积极、清晰。充满光明和能量的时刻，享受成功和内心的喜悦。',
      reversed: '暂时的消沉、过度乐观、不切实际、缺乏活力。需要调整期待，找回内心的阳光。'
    },
    keywords: {
      upright: ['成功', '快乐', '活力', '积极'],
      reversed: ['消沉', '不切实际', '缺乏活力']
    }
  },
  {
    id: 20,
    name: '审判',
    nameEn: 'Judgement',
    type: 'major',
    image: '📯',
    meaning: {
      upright: '觉醒、重生、救赎、召唤、自我评估。是时候反思过去，做出重要的人生选择，获得新生。',
      reversed: '自我怀疑、拒绝召唤、无法原谅、逃避审视。需要放下对自己的批判，拥抱新的可能。'
    },
    keywords: {
      upright: ['觉醒', '重生', '召唤', '反思'],
      reversed: ['自我怀疑', '逃避', '无法原谅']
    }
  },
  {
    id: 21,
    name: '世界',
    nameEn: 'The World',
    type: 'major',
    image: '🌍',
    meaning: {
      upright: '完成、整合、成就、旅行、圆满。一个周期圆满结束，你已经完成了重要的目标。',
      reversed: '未完成、缺乏闭合、停滞、追求完美。需要检查还有什么未完成的事情需要处理。'
    },
    keywords: {
      upright: ['完成', '成就', '圆满', '整合'],
      reversed: ['未完成', '停滞', '不完美']
    }
  }
];

const suitNames = {
  wands: '权杖',
  cups: '圣杯',
  swords: '宝剑',
  pentacles: '星币'
};

const suitEmojis = {
  wands: '🔥',
  cups: '💧',
  swords: '💨',
  pentacles: '🌿'
};

const minorArcanaMeanings = {
  wands: {
    upright: '创造力、热情、行动、灵感、事业',
    reversed: '延迟、挫折、缺乏动力、创意受阻'
  },
  cups: {
    upright: '情感、爱情、直觉、关系、心灵',
    reversed: '情感压抑、失望、失去联系、抑郁'
  },
  swords: {
    upright: '思想、真理、冲突、沟通、行动',
    reversed: '混乱、欺骗、逃避问题、精神紧张'
  },
  pentacles: {
    upright: '物质、财富、实际、工作、自然',
    reversed: '财务问题、贪婪、物质主义、缺乏规划'
  }
};

const numberNames = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const courtNames = ['侍从', '骑士', '王后', '国王'];

function createMinorArcana(): TarotCard[] {
  const cards: TarotCard[] = [];
  let id = 22;

  const suits: ('wands' | 'cups' | 'swords' | 'pentacles')[] = ['wands', 'cups', 'swords', 'pentacles'];

  for (const suit of suits) {
    for (let num = 1; num <= 10; num++) {
      cards.push({
        id: id++,
        name: `${suitNames[suit]}${numberNames[num]}`,
        nameEn: `${num} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
        type: 'minor',
        suit,
        number: num,
        image: suitEmojis[suit],
        meaning: {
          upright: `${minorArcanaMeanings[suit].upright}。第${numberNames[num]}张牌代表着这一元素的${num === 1 ? '新开始' : num === 10 ? '完成' : '发展'}阶段。`,
          reversed: `${minorArcanaMeanings[suit].reversed}。逆位时能量受阻或过度表达。`
        },
        keywords: {
          upright: [minorArcanaMeanings[suit].upright.split('、')[num % 4]],
          reversed: [minorArcanaMeanings[suit].reversed.split('、')[num % 4]]
        }
      });
    }

    for (let i = 0; i < 4; i++) {
      cards.push({
        id: id++,
        name: `${suitNames[suit]}${courtNames[i]}`,
        nameEn: `${courtNames[i]} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
        type: 'minor',
        suit,
        number: 11 + i,
        image: suitEmojis[suit],
        meaning: {
          upright: `${courtNames[i]}代表着${suitNames[suit]}元素的成熟表达。${i === 0 ? '学习与探索' : i === 1 ? '行动与追求' : i === 2 ? '滋养与理解' : '掌控与智慧'}。`,
          reversed: `这张宫廷牌逆位时，可能表现出该角色的负面特质或能量失衡。`
        },
        keywords: {
          upright: [courtNames[i], suitNames[suit]],
          reversed: ['负面特质', '能量失衡']
        }
      });
    }
  }

  return cards;
}

export const tarotCards: TarotCard[] = [...majorArcana, ...createMinorArcana()];

export const getCardById = (id: number): TarotCard | undefined => {
  return tarotCards.find(c => c.id === id);
};

export const shuffleCards = (cards: TarotCard[]): TarotCard[] => {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
