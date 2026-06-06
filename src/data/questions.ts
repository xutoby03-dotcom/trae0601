import type { Question } from '@/types';

export const questions: Question[] = [
  {
    id: 1,
    scenario: '周末朋友聚会，你更倾向于：',
    options: [
      { text: '主动组织，成为派对中心', dimension: 'E', weight: 2 },
      { text: '参与其中，认识新朋友', dimension: 'E', weight: 1 },
      { text: '和几个熟悉的朋友聊天', dimension: 'I', weight: 1 },
      { text: '找借口不去，宁愿宅家', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 2,
    scenario: '工作中遇到新问题，你通常：',
    options: [
      { text: '马上找同事讨论 brainstorm', dimension: 'E', weight: 2 },
      { text: '先和人交流再思考', dimension: 'E', weight: 1 },
      { text: '自己先想清楚再沟通', dimension: 'I', weight: 1 },
      { text: '独立研究，想通了再说', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 3,
    scenario: '休假时，你更喜欢：',
    options: [
      { text: '去热门景点打卡凑热闹', dimension: 'E', weight: 2 },
      { text: '约三五好友一起旅行', dimension: 'E', weight: 1 },
      { text: '找个安静地方放空', dimension: 'I', weight: 1 },
      { text: '在家看剧读书最舒服', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 4,
    scenario: '开会时，你通常：',
    options: [
      { text: '想到就说，边说边想', dimension: 'E', weight: 2 },
      { text: '积极参与讨论', dimension: 'E', weight: 1 },
      { text: '先听别人说，偶尔发言', dimension: 'I', weight: 1 },
      { text: '默默听，会后私下说', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 5,
    scenario: '社交后回到家，你感觉：',
    options: [
      { text: '精力充沛，还想聊', dimension: 'E', weight: 2 },
      { text: '挺开心，有点小累', dimension: 'E', weight: 1 },
      { text: '有点累，想安静会儿', dimension: 'I', weight: 1 },
      { text: '身心俱疲，需要充电', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 6,
    scenario: '做决定时，你更依赖：',
    options: [
      { text: '过往经验和事实数据', dimension: 'S', weight: 2 },
      { text: '具体细节和实际情况', dimension: 'S', weight: 1 },
      { text: '直觉和整体感觉', dimension: 'N', weight: 1 },
      { text: '灵感和未来可能性', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 7,
    scenario: '看电影时，你更关注：',
    options: [
      { text: '剧情细节是否合理', dimension: 'S', weight: 2 },
      { text: '演员表演和画面', dimension: 'S', weight: 1 },
      { text: '隐喻和深层含义', dimension: 'N', weight: 1 },
      { text: '脑洞大开的设定', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 8,
    scenario: '学习新技能，你偏好：',
    options: [
      { text: '按步骤一步步来', dimension: 'S', weight: 2 },
      { text: '从实际案例入手', dimension: 'S', weight: 1 },
      { text: '先理解概念和理论', dimension: 'N', weight: 1 },
      { text: '跳跃式学习，自己摸索', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 9,
    scenario: '描述一件事，你倾向于：',
    options: [
      { text: '具体时间地点人物', dimension: 'S', weight: 2 },
      { text: '客观事实和细节', dimension: 'S', weight: 1 },
      { text: '大概感觉和氛围', dimension: 'N', weight: 1 },
      { text: '用比喻和联想表达', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 10,
    scenario: '面对未来，你更：',
    options: [
      { text: '关注当下，走一步看一步', dimension: 'S', weight: 2 },
      { text: '做短期计划，务实前行', dimension: 'S', weight: 1 },
      { text: '经常畅想各种可能性', dimension: 'N', weight: 1 },
      { text: '满脑子都是未来愿景', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 11,
    scenario: '朋友遇到困难向你倾诉，你会：',
    options: [
      { text: '理性分析问题，给解决方案', dimension: 'T', weight: 2 },
      { text: '先讲道理，再安慰', dimension: 'T', weight: 1 },
      { text: '先共情，表示理解', dimension: 'F', weight: 1 },
      { text: '陪 TA 一起骂一起哭', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 12,
    scenario: '团队合作中出现矛盾，你倾向于：',
    options: [
      { text: '客观指出问题，对事不对人', dimension: 'T', weight: 2 },
      { text: '讲道理，找公平解决方案', dimension: 'T', weight: 1 },
      { text: '照顾大家情绪，求和谐', dimension: 'F', weight: 1 },
      { text: '优先维护团队关系', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 13,
    scenario: '做重要决定时，你更看重：',
    options: [
      { text: '逻辑是否通顺，利弊分析', dimension: 'T', weight: 2 },
      { text: '客观标准和原则', dimension: 'T', weight: 1 },
      { text: '相关人的感受和影响', dimension: 'F', weight: 1 },
      { text: '是否遵从内心价值观', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 14,
    scenario: '被人批评时，你的第一反应：',
    options: [
      { text: '思考批评有没有道理', dimension: 'T', weight: 2 },
      { text: '分析对方的逻辑漏洞', dimension: 'T', weight: 1 },
      { text: '有点难过，但会反思', dimension: 'F', weight: 1 },
      { text: '很受伤，情绪波动大', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 15,
    scenario: '看辩论节目，你倾向于：',
    options: [
      { text: '看谁逻辑更严谨', dimension: 'T', weight: 2 },
      { text: '关注论点是否有力', dimension: 'T', weight: 1 },
      { text: '被选手的故事打动', dimension: 'F', weight: 1 },
      { text: '共情弱者，支持感性方', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 16,
    scenario: '你的工作/学习风格是：',
    options: [
      { text: '提前规划，按计划执行', dimension: 'J', weight: 2 },
      { text: '有大致计划，灵活调整', dimension: 'J', weight: 1 },
      { text: '临到 deadline 才有动力', dimension: 'P', weight: 1 },
      { text: '随心所欲，想到哪做到哪', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 17,
    scenario: '旅行时，你更偏好：',
    options: [
      { text: '详细攻略，每天行程排满', dimension: 'J', weight: 2 },
      { text: '定好大方向，每天安排一些', dimension: 'J', weight: 1 },
      { text: '只订票和酒店，到了再说', dimension: 'P', weight: 1 },
      { text: '说走就走，完全不做计划', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 18,
    scenario: '房间/桌面的状态通常是：',
    options: [
      { text: '井井有条，东西各归其位', dimension: 'J', weight: 2 },
      { text: '基本整齐，偶尔小乱', dimension: 'J', weight: 1 },
      { text: '有点乱，但乱中有序', dimension: 'P', weight: 1 },
      { text: '创意性混乱，找东西靠缘分', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 19,
    scenario: '面对截止日期，你会：',
    options: [
      { text: '提前很久就完成', dimension: 'J', weight: 2 },
      { text: '提前几天做完留缓冲', dimension: 'J', weight: 1 },
      { text: ' deadline 前一天冲刺', dimension: 'P', weight: 1 },
      { text: '踩着点交，甚至延期', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 20,
    scenario: '做选择时，你更倾向于：',
    options: [
      { text: '快速决定，不想纠结', dimension: 'J', weight: 2 },
      { text: '考虑清楚就定下来', dimension: 'J', weight: 1 },
      { text: '多看看，保留选项', dimension: 'P', weight: 1 },
      { text: '选择困难，能拖就拖', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 21,
    scenario: '参加大型社交活动，你通常：',
    options: [
      { text: '全场游走，认识各种人', dimension: 'E', weight: 2 },
      { text: '和不同的人寒暄聊天', dimension: 'E', weight: 1 },
      { text: '和一两个熟人待在一起', dimension: 'I', weight: 1 },
      { text: '找个角落观察人群', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 22,
    scenario: '长时间独处后，你会：',
    options: [
      { text: '无聊到爆，想找人玩', dimension: 'E', weight: 2 },
      { text: '开始想联系朋友', dimension: 'E', weight: 1 },
      { text: '挺舒服，但可以社交下', dimension: 'I', weight: 1 },
      { text: '神清气爽，还想继续', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 23,
    scenario: '打电话 vs 发消息，你更喜欢：',
    options: [
      { text: '直接打电话，效率高', dimension: 'E', weight: 2 },
      { text: '重要的事打电话', dimension: 'E', weight: 1 },
      { text: '先消息，必要时打电话', dimension: 'I', weight: 1 },
      { text: '能发消息绝不打电话', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 24,
    scenario: '小组作业，你倾向于：',
    options: [
      { text: '组织大家一起讨论', dimension: 'E', weight: 2 },
      { text: '和组员多沟通协作', dimension: 'E', weight: 1 },
      { text: '分工明确，各自完成', dimension: 'I', weight: 1 },
      { text: '宁愿自己做省得麻烦', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 25,
    scenario: '别人对你的评价通常是：',
    options: [
      { text: '外向活泼，话很多', dimension: 'E', weight: 2 },
      { text: '开朗健谈，好相处', dimension: 'E', weight: 1 },
      { text: '安静内敛，话不多', dimension: 'I', weight: 1 },
      { text: '高冷神秘，有距离感', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 26,
    scenario: '读小说时，你更在意：',
    options: [
      { text: '情节是否真实可信', dimension: 'S', weight: 2 },
      { text: '人物细节和环境描写', dimension: 'S', weight: 1 },
      { text: '象征意义和主题思想', dimension: 'N', weight: 1 },
      { text: '独特的世界观设定', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 27,
    scenario: '解决问题时，你更倾向于：',
    options: [
      { text: '用成熟可靠的方法', dimension: 'S', weight: 2 },
      { text: '参考过往成功经验', dimension: 'S', weight: 1 },
      { text: '尝试创新的方法', dimension: 'N', weight: 1 },
      { text: '想出各种奇思妙想', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 28,
    scenario: '你更相信：',
    options: [
      { text: '实践出真知', dimension: 'S', weight: 2 },
      { text: '亲眼看到的事实', dimension: 'S', weight: 1 },
      { text: '第六感和直觉', dimension: 'N', weight: 1 },
      { text: '灵感和顿悟', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 29,
    scenario: '聊天时，你更喜欢：',
    options: [
      { text: '聊具体的生活琐事', dimension: 'S', weight: 2 },
      { text: '聊兴趣爱好和美食', dimension: 'S', weight: 1 },
      { text: '聊哲学、人生、理想', dimension: 'N', weight: 1 },
      { text: '聊各种脑洞和假设', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 30,
    scenario: '工作中，你更擅长：',
    options: [
      { text: '处理具体细节事务', dimension: 'S', weight: 2 },
      { text: '执行既定方案', dimension: 'S', weight: 1 },
      { text: '战略规划和方向', dimension: 'N', weight: 1 },
      { text: '创新和头脑风暴', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 31,
    scenario: '和别人意见不合时，你会：',
    options: [
      { text: '据理力争，逻辑为王', dimension: 'T', weight: 2 },
      { text: '理性讨论，找出最优解', dimension: 'T', weight: 1 },
      { text: '委婉表达，照顾对方情绪', dimension: 'F', weight: 1 },
      { text: '避免冲突，和谐最重要', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 32,
    scenario: '评价一部作品，你更看重：',
    options: [
      { text: '结构是否严谨，手法是否高明', dimension: 'T', weight: 2 },
      { text: '是否有深度和启发性', dimension: 'T', weight: 1 },
      { text: '能不能打动我的心', dimension: 'F', weight: 1 },
      { text: '有没有让我共情落泪', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 33,
    scenario: '看到路边的乞丐，你会想：',
    options: [
      { text: '是不是骗子，值不值得帮', dimension: 'T', weight: 2 },
      { text: '分析下 TA 的情况', dimension: 'T', weight: 1 },
      { text: 'TA 好可怜，帮帮 TA', dimension: 'F', weight: 1 },
      { text: '心情变得很沉重', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 34,
    scenario: '你认为自己更多是：',
    options: [
      { text: '理性、冷静、客观', dimension: 'T', weight: 2 },
      { text: '讲道理、讲原则', dimension: 'T', weight: 1 },
      { text: '热心、体贴、有同理心', dimension: 'F', weight: 1 },
      { text: '感性、情绪化、重感情', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 35,
    scenario: '职场中，你更看重：',
    options: [
      { text: '能力和业绩说话', dimension: 'T', weight: 2 },
      { text: '公平公正的制度', dimension: 'T', weight: 1 },
      { text: '和谐的团队氛围', dimension: 'F', weight: 1 },
      { text: '有人情味的企业文化', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 36,
    scenario: '你的衣柜通常是：',
    options: [
      { text: '分类清晰，搭配成套', dimension: 'J', weight: 2 },
      { text: '整理过，基本好找', dimension: 'J', weight: 1 },
      { text: '堆放着，但能找到', dimension: 'P', weight: 1 },
      { text: '混乱，找不到想穿的', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 37,
    scenario: '对于突发变化，你通常：',
    options: [
      { text: '有点焦虑，想恢复秩序', dimension: 'J', weight: 2 },
      { text: '调整计划，适应变化', dimension: 'J', weight: 1 },
      { text: '有点惊喜，随机应变', dimension: 'P', weight: 1 },
      { text: '太酷了，就喜欢变数', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 38,
    scenario: '每天早上起床，你：',
    options: [
      { text: '闹钟一响就起，按流程来', dimension: 'J', weight: 2 },
      { text: '稍微赖下床，然后按部就班', dimension: 'J', weight: 1 },
      { text: '能赖多久赖多久', dimension: 'P', weight: 1 },
      { text: '看心情，想起再起', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 39,
    scenario: '购物时，你倾向于：',
    options: [
      { text: '列好清单，目标明确', dimension: 'J', weight: 2 },
      { text: '心里有数，不瞎逛', dimension: 'J', weight: 1 },
      { text: '逛逛看，有喜欢的就买', dimension: 'P', weight: 1 },
      { text: '即兴购物，经常买没用的', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 40,
    scenario: '完成一项任务，你偏好：',
    options: [
      { text: '尽早完成，了结心事', dimension: 'J', weight: 2 },
      { text: '按进度稳步推进', dimension: 'J', weight: 1 },
      { text: '最后时刻效率最高', dimension: 'P', weight: 1 },
      { text: '边做边改，灵活调整', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 41,
    scenario: '在新朋友面前，你通常：',
    options: [
      { text: '主动自我介绍，打开话题', dimension: 'E', weight: 2 },
      { text: '友好互动，很快熟络', dimension: 'E', weight: 1 },
      { text: '有点慢热，熟悉后话多', dimension: 'I', weight: 1 },
      { text: '安静观察，不多说话', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 42,
    scenario: '你觉得自己的能量来自：',
    options: [
      { text: '和人互动交流', dimension: 'E', weight: 2 },
      { text: '参与各种活动', dimension: 'E', weight: 1 },
      { text: '一个人待着思考', dimension: 'I', weight: 1 },
      { text: '沉浸在自己的世界', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 43,
    scenario: '微信收到消息，你通常：',
    options: [
      { text: '秒回，不喜欢压消息', dimension: 'E', weight: 2 },
      { text: '看到就回，除非太忙', dimension: 'E', weight: 1 },
      { text: '想一想再回，有时会忘', dimension: 'I', weight: 1 },
      { text: '经常已读不回', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 44,
    scenario: '公众场合发言，你会：',
    options: [
      { text: '享受舞台，侃侃而谈', dimension: 'E', weight: 2 },
      { text: '准备好就没问题', dimension: 'E', weight: 1 },
      { text: '有点紧张，但能完成', dimension: 'I', weight: 1 },
      { text: '能避免就避免', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 45,
    scenario: '朋友约你出门，你通常：',
    options: [
      { text: '马上答应，期待出门', dimension: 'E', weight: 2 },
      { text: '有空就去，挺开心', dimension: 'E', weight: 1 },
      { text: '考虑一下，看状态', dimension: 'I', weight: 1 },
      { text: '想各种理由推脱', dimension: 'I', weight: 2 },
    ],
  },
  {
    id: 46,
    scenario: '看待事物，你更关注：',
    options: [
      { text: '具体的事实和细节', dimension: 'S', weight: 2 },
      { text: '真实存在的东西', dimension: 'S', weight: 1 },
      { text: '事物之间的联系', dimension: 'N', weight: 1 },
      { text: '背后的规律和本质', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 47,
    scenario: '做创意工作，你更擅长：',
    options: [
      { text: '把创意落地执行', dimension: 'S', weight: 2 },
      { text: '完善创意的细节', dimension: 'S', weight: 1 },
      { text: '提出创意点子', dimension: 'N', weight: 1 },
      { text: '天马行空地想象', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 48,
    scenario: '别人说话时，你更留意：',
    options: [
      { text: '对方说的具体内容', dimension: 'S', weight: 2 },
      { text: '事实和数据是否准确', dimension: 'S', weight: 1 },
      { text: '弦外之音和潜台词', dimension: 'N', weight: 1 },
      { text: '对方没说出来的意思', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 49,
    scenario: '回忆过去，你更多想起：',
    options: [
      { text: '具体的画面和细节', dimension: 'S', weight: 2 },
      { text: '当时做了什么事', dimension: 'S', weight: 1 },
      { text: '当时的感觉和情绪', dimension: 'N', weight: 1 },
      { text: '那段经历的意义', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 50,
    scenario: '学新知识，你倾向于：',
    options: [
      { text: '从基础开始，循序渐进', dimension: 'S', weight: 2 },
      { text: '结合实例学习', dimension: 'S', weight: 1 },
      { text: '先建立整体框架', dimension: 'N', weight: 1 },
      { text: '从感兴趣的点切入', dimension: 'N', weight: 2 },
    ],
  },
  {
    id: 51,
    scenario: '身边朋友难过时，你通常：',
    options: [
      { text: '帮 TA 分析问题出在哪', dimension: 'T', weight: 2 },
      { text: '给 TA 建议怎么解决', dimension: 'T', weight: 1 },
      { text: '听 TA 倾诉，给拥抱', dimension: 'F', weight: 1 },
      { text: '陪着 TA，一起难过', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 52,
    scenario: '你更认同哪句话？',
    options: [
      { text: '真理越辩越明', dimension: 'T', weight: 2 },
      { text: '讲理不讲情', dimension: 'T', weight: 1 },
      { text: '爱是一切的答案', dimension: 'F', weight: 1 },
      { text: '家是讲爱的地方', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 53,
    scenario: '做判断时，你更依赖：',
    options: [
      { text: '逻辑推理', dimension: 'T', weight: 2 },
      { text: '客观分析', dimension: 'T', weight: 1 },
      { text: '个人价值观', dimension: 'F', weight: 1 },
      { text: '内心感受', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 54,
    scenario: '被人误解时，你会：',
    options: [
      { text: '冷静解释清楚', dimension: 'T', weight: 2 },
      { text: '拿出证据证明自己', dimension: 'T', weight: 1 },
      { text: '很委屈，但会解释', dimension: 'F', weight: 1 },
      { text: '难过到不想说话', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 55,
    scenario: '看感人的电影，你：',
    options: [
      { text: '基本不会哭，觉得假', dimension: 'T', weight: 2 },
      { text: '偶尔会被打动', dimension: 'T', weight: 1 },
      { text: '经常看哭', dimension: 'F', weight: 1 },
      { text: '哭得稀里哗啦', dimension: 'F', weight: 2 },
    ],
  },
  {
    id: 56,
    scenario: '对于规则和秩序，你认为：',
    options: [
      { text: '必须遵守，无规矩不成方圆', dimension: 'J', weight: 2 },
      { text: '大家都该遵守', dimension: 'J', weight: 1 },
      { text: '规则是死的，人是活的', dimension: 'P', weight: 1 },
      { text: '规则就是用来打破的', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 57,
    scenario: '你的人生态度是：',
    options: [
      { text: '凡事预则立，不预则废', dimension: 'J', weight: 2 },
      { text: '有目标，有计划地前进', dimension: 'J', weight: 1 },
      { text: '船到桥头自然直', dimension: 'P', weight: 1 },
      { text: '及时行乐，活在当下', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 58,
    scenario: '同时有很多事要做，你会：',
    options: [
      { text: '列清单，按优先级排序做', dimension: 'J', weight: 2 },
      { text: '心里有个先后顺序', dimension: 'J', weight: 1 },
      { text: '想到哪做到哪', dimension: 'P', weight: 1 },
      { text: '手忙脚乱，压力大', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 59,
    scenario: '约会/聚会时，你通常：',
    options: [
      { text: '提前到达，从不迟到', dimension: 'J', weight: 2 },
      { text: '准点或稍微提前', dimension: 'J', weight: 1 },
      { text: '偶尔会迟到', dimension: 'P', weight: 1 },
      { text: '经常迟到，被吐槽', dimension: 'P', weight: 2 },
    ],
  },
  {
    id: 60,
    scenario: '任务完成后，你会：',
    options: [
      { text: '马上开始下一个任务', dimension: 'J', weight: 2 },
      { text: '稍微休息，然后规划下一步', dimension: 'J', weight: 1 },
      { text: '好好放松一下', dimension: 'P', weight: 1 },
      { text: '彻底放飞自我', dimension: 'P', weight: 2 },
    ],
  },
];
