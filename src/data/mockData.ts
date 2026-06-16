import type { Player, Script, GameSession, Rating } from '@/types';

export const mockPlayers: Player[] = [
  {
    id: 'player-1',
    name: '林小雨',
    avatar: '🌸',
    gender: 'female',
    preferredGenres: ['情感', '推理', '还原'],
    triggers: ['jump scare', '血腥', '霸凌'],
    emotionTolerance: 8,
    horrorTolerance: 3,
    willingToCrossdress: false,
    historicalOk: true
  },
  {
    id: 'player-2',
    name: '陈默',
    avatar: '🎭',
    gender: 'male',
    preferredGenres: ['硬核', '推理', '机制'],
    triggers: ['虐心', '悲剧'],
    emotionTolerance: 4,
    horrorTolerance: 7,
    willingToCrossdress: true,
    historicalOk: false
  },
  {
    id: 'player-3',
    name: '苏婉清',
    avatar: '🦋',
    gender: 'female',
    preferredGenres: ['古风', '情感', '阵营'],
    triggers: ['死亡', '家暴'],
    emotionTolerance: 9,
    horrorTolerance: 2,
    willingToCrossdress: false,
    historicalOk: true
  },
  {
    id: 'player-4',
    name: '王浩然',
    avatar: '⚡',
    gender: 'male',
    preferredGenres: ['恐怖', '欢乐', '机制'],
    triggers: [],
    emotionTolerance: 6,
    horrorTolerance: 10,
    willingToCrossdress: true,
    historicalOk: true
  },
  {
    id: 'player-5',
    name: '周思琪',
    avatar: '🌙',
    gender: 'female',
    preferredGenres: ['推理', '还原', '科幻'],
    triggers: ['封闭空间', '追逐'],
    emotionTolerance: 5,
    horrorTolerance: 5,
    willingToCrossdress: false,
    historicalOk: false
  },
  {
    id: 'player-6',
    name: '李子轩',
    avatar: '🌟',
    gender: 'male',
    preferredGenres: ['欢乐', '阵营', '现代'],
    triggers: ['抑郁', '自杀'],
    emotionTolerance: 7,
    horrorTolerance: 4,
    willingToCrossdress: false,
    historicalOk: true
  }
];

export const mockScripts: Script[] = [
  {
    id: 'script-1',
    title: '雾海迷舟',
    playerCount: 6,
    duration: 300,
    store: '迷雾剧社',
    price: 168,
    genre: '推理',
    cover: '🌫️',
    characters: [
      {
        id: 'char-1-1',
        name: '顾远航',
        description: '船长，45岁，沉稳老练，眼神中总藏着秘密',
        gender: 'male',
        tags: ['推理', '还原', '领导力'],
        isEdge: false,
        isRomanceLead: false,
        isHorrorFocus: false,
        genre: '推理'
      },
      {
        id: 'char-1-2',
        name: '林若诗',
        description: '富家千金，23岁，看似柔弱实则聪慧',
        gender: 'female',
        tags: ['推理', '情感', '还原'],
        isEdge: false,
        isRomanceLead: true,
        isHorrorFocus: false,
        genre: '推理'
      },
      {
        id: 'char-1-3',
        name: '张医生',
        description: '随船医生，38岁，医术高明但行踪诡秘',
        gender: 'male',
        tags: ['推理', '硬核', '反转'],
        isEdge: false,
        isRomanceLead: false,
        isHorrorFocus: false,
        genre: '推理'
      },
      {
        id: 'char-1-4',
        name: '苏梅',
        description: '女仆，28岁，沉默寡言，知道很多秘密',
        gender: 'female',
        tags: ['推理', '边缘', '信息位'],
        isEdge: true,
        isRomanceLead: false,
        isHorrorFocus: false,
        genre: '推理'
      },
      {
        id: 'char-1-5',
        name: '陈记者',
        description: '报社记者，30岁，好奇心旺盛，追查真相',
        gender: 'male',
        tags: ['推理', '欢乐', '机制'],
        isEdge: false,
        isRomanceLead: true,
        isHorrorFocus: false,
        genre: '推理'
      },
      {
        id: 'char-1-6',
        name: '神秘女子',
        description: '身份不明，25岁，戴着面纱，气质神秘',
        gender: 'female',
        tags: ['推理', '核心', '反转'],
        isEdge: false,
        isRomanceLead: false,
        isHorrorFocus: true,
        genre: '推理'
      }
    ]
  },
  {
    id: 'script-2',
    title: '桃花诺',
    playerCount: 5,
    duration: 240,
    store: '浮生如梦',
    price: 198,
    genre: '情感',
    cover: '🌸',
    characters: [
      {
        id: 'char-2-1',
        name: '慕容雪',
        description: '丞相之女，才貌双全，与太子有婚约',
        gender: 'female',
        tags: ['古风', '情感', '虐心'],
        isEdge: false,
        isRomanceLead: true,
        isHorrorFocus: false,
        genre: '古风'
      },
      {
        id: 'char-2-2',
        name: '萧煜',
        description: '当朝太子，文武双全，心中藏着深爱之人',
        gender: 'male',
        tags: ['古风', '情感', '虐心', '背叛'],
        isEdge: false,
        isRomanceLead: true,
        isHorrorFocus: false,
        genre: '古风'
      },
      {
        id: 'char-2-3',
        name: '林语嫣',
        description: '江湖侠女，性格豪爽，与男主有过往',
        gender: 'female',
        tags: ['古风', '情感', '武侠'],
        isEdge: false,
        isRomanceLead: true,
        isHorrorFocus: false,
        genre: '古风'
      },
      {
        id: 'char-2-4',
        name: '苏慕白',
        description: '白衣书生，温润如玉，默默守护女主',
        gender: 'male',
        tags: ['古风', '情感', '悲剧'],
        isEdge: false,
        isRomanceLead: false,
        isHorrorFocus: false,
        genre: '古风'
      },
      {
        id: 'char-2-5',
        name: '公公',
        description: '皇帝身边的太监，见证了一切',
        gender: 'male',
        tags: ['古风', '情感', '边缘'],
        isEdge: true,
        isRomanceLead: false,
        isHorrorFocus: false,
        genre: '古风'
      }
    ]
  },
  {
    id: 'script-3',
    title: '午夜教学楼',
    playerCount: 6,
    duration: 270,
    store: '惊魂密室',
    price: 228,
    genre: '恐怖',
    cover: '👻',
    characters: [
      {
        id: 'char-3-1',
        name: '张老师',
        description: '语文老师，35岁，深夜被叫到学校',
        gender: 'female',
        tags: ['恐怖', '校园', 'jump scare'],
        isEdge: false,
        isRomanceLead: false,
        isHorrorFocus: true,
        genre: '校园'
      },
      {
        id: 'char-3-2',
        name: '李小明',
        description: '高三学生，18岁，胆大调皮',
        gender: 'male',
        tags: ['恐怖', '校园', '欢乐', '追逐'],
        isEdge: false,
        isRomanceLead: false,
        isHorrorFocus: true,
        genre: '校园'
      },
      {
        id: 'char-3-3',
        name: '王晓婷',
        description: '高二学生，17岁，敏感胆小',
        gender: 'female',
        tags: ['恐怖', '校园', '虐心', '霸凌'],
        isEdge: false,
        isRomanceLead: false,
        isHorrorFocus: true,
        genre: '校园'
      },
      {
        id: 'char-3-4',
        name: '赵保安',
        description: '学校保安，50岁，在这工作了30年',
        gender: 'male',
        tags: ['恐怖', '校园', '封闭空间', '灵异'],
        isEdge: false,
        isRomanceLead: false,
        isHorrorFocus: true,
        genre: '校园'
      },
      {
        id: 'char-3-5',
        name: '林校花',
        description: '校花，18岁，美丽神秘',
        gender: 'female',
        tags: ['恐怖', '校园', '情感', '死亡'],
        isEdge: false,
        isRomanceLead: true,
        isHorrorFocus: true,
        genre: '校园'
      },
      {
        id: 'char-3-6',
        name: '清洁阿姨',
        description: '清洁工，45岁，知道学校的秘密',
        gender: 'female',
        tags: ['恐怖', '校园', '边缘', '信息位'],
        isEdge: true,
        isRomanceLead: false,
        isHorrorFocus: false,
        genre: '校园'
      }
    ]
  }
];

export const mockSessions: GameSession[] = [
  {
    id: 'session-1',
    scriptId: 'script-1',
    playerIds: ['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'],
    assignments: [
      { playerId: 'player-1', characterId: 'char-1-2' },
      { playerId: 'player-2', characterId: 'char-1-3' },
      { playerId: 'player-3', characterId: 'char-1-6' },
      { playerId: 'player-4', characterId: 'char-1-5' },
      { playerId: 'player-5', characterId: 'char-1-1' },
      { playerId: 'player-6', characterId: 'char-1-4' }
    ],
    status: 'finished',
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'session-2',
    scriptId: 'script-2',
    playerIds: ['player-1', 'player-2', 'player-3', 'player-5', 'player-6'],
    assignments: [
      { playerId: 'player-1', characterId: 'char-2-1' },
      { playerId: 'player-2', characterId: 'char-2-4' },
      { playerId: 'player-3', characterId: 'char-2-3' },
      { playerId: 'player-5', characterId: 'char-2-2' },
      { playerId: 'player-6', characterId: 'char-2-5' }
    ],
    status: 'finished',
    createdAt: Date.now() - 86400000 * 3
  }
];

export const mockRatings: Rating[] = [
  {
    id: 'rating-1',
    sessionId: 'session-1',
    playerId: 'player-1',
    characterId: 'char-1-2',
    characterScore: 5,
    scriptScore: 4,
    comment: '角色情感线很饱满，推理也在线'
  },
  {
    id: 'rating-2',
    sessionId: 'session-1',
    playerId: 'player-2',
    characterId: 'char-1-3',
    characterScore: 4,
    scriptScore: 5,
    comment: '硬核推理，推得很爽'
  },
  {
    id: 'rating-3',
    sessionId: 'session-1',
    playerId: 'player-3',
    characterId: 'char-1-6',
    characterScore: 3,
    scriptScore: 4,
    comment: '角色有点恐怖，不过整体不错'
  },
  {
    id: 'rating-4',
    sessionId: 'session-1',
    playerId: 'player-4',
    characterId: 'char-1-5',
    characterScore: 4,
    scriptScore: 4,
    comment: '记者角色很有参与感'
  },
  {
    id: 'rating-5',
    sessionId: 'session-1',
    playerId: 'player-5',
    characterId: 'char-1-1',
    characterScore: 4,
    scriptScore: 4,
    comment: '船长位信息很多，体验不错'
  },
  {
    id: 'rating-6',
    sessionId: 'session-1',
    playerId: 'player-6',
    characterId: 'char-1-4',
    characterScore: 2,
    scriptScore: 3,
    comment: '边缘位有点无聊'
  },
  {
    id: 'rating-7',
    sessionId: 'session-2',
    playerId: 'player-1',
    characterId: 'char-2-1',
    characterScore: 5,
    scriptScore: 5,
    comment: '太好哭了！情感线绝了'
  },
  {
    id: 'rating-8',
    sessionId: 'session-2',
    playerId: 'player-2',
    characterId: 'char-2-4',
    characterScore: 3,
    scriptScore: 4,
    comment: '情感本不是我的菜，但本写得还行'
  },
  {
    id: 'rating-9',
    sessionId: 'session-2',
    playerId: 'player-3',
    characterId: 'char-2-3',
    characterScore: 5,
    scriptScore: 5,
    comment: '侠女人设太戳我了，古风yyds'
  },
  {
    id: 'rating-10',
    sessionId: 'session-2',
    playerId: 'player-5',
    characterId: 'char-2-2',
    characterScore: 4,
    scriptScore: 4,
    comment: '太子位有点虐，不过体验尚可'
  },
  {
    id: 'rating-11',
    sessionId: 'session-2',
    playerId: 'player-6',
    characterId: 'char-2-5',
    characterScore: 3,
    scriptScore: 4,
    comment: '公公位有点边缘，但故事很感人'
  }
];
