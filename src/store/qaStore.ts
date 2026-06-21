import { create } from 'zustand';
import type {
  Question,
  QuestionSource,
  QuestionStatus,
  AnswerRecord,
  EventConfig,
  SortMode,
  FilterMode,
} from '../types';

const DEFAULT_TOPICS = ['技术实现', '产品规划', '商业模式', '行业趋势', '团队协作', '其他'];

const generateId = () => Math.random().toString(36).slice(2, 10);

interface QAStore {
  event: EventConfig;
  questions: Question[];
  answers: Record<string, AnswerRecord>;
  sortMode: SortMode;
  filterMode: FilterMode;
  selectedTopic: string | null;

  setEventTitle: (title: string) => void;
  addTopic: (topic: string) => void;
  removeTopic: (topic: string) => void;

  addQuestion: (data: {
    content: string;
    asker: string;
    source: QuestionSource;
    topic: string;
  }) => void;

  voteQuestion: (id: string) => void;
  updateQuestionStatus: (id: string, status: QuestionStatus) => void;
  updateQuestionTopic: (id: string, topic: string) => void;
  deleteQuestion: (id: string) => void;

  mergeQuestions: (targetId: string, sourceIds: string[]) => void;
  findSimilar: (id: string) => string[];

  setSortMode: (mode: SortMode) => void;
  setFilterMode: (mode: FilterMode) => void;
  setSelectedTopic: (topic: string | null) => void;

  recordAnswer: (data: {
    questionId: string;
    summary: string;
    followUpMaterials: string;
    speakerName?: string;
  }) => void;
  updateAnswer: (questionId: string, data: Partial<AnswerRecord>) => void;

  getFilteredQuestions: () => Question[];
  getAnsweredWithRecords: () => Array<{ question: Question; answer: AnswerRecord }>;
  exportMinutes: () => string;
  exportFollowupMinutes: () => string;

  resetAll: () => void;
}

const createInitialEvent = (): EventConfig => ({
  id: generateId(),
  title: '2026公开课问答',
  topics: [...DEFAULT_TOPICS],
  createdAt: Date.now(),
});

const initialQuestions: Question[] = [
  {
    id: generateId(),
    content: '请问这套架构在高并发场景下如何做限流和降级？有没有实际的生产案例可以分享？',
    asker: '李明',
    source: 'onsite',
    topic: '技术实现',
    heat: 28,
    status: 'queued',
    createdAt: Date.now() - 3600000,
  },
  {
    id: generateId(),
    content: '未来3个月产品路线图里会支持小程序端吗？我们团队很期待这个功能。',
    asker: '王芳',
    source: 'online',
    topic: '产品规划',
    heat: 45,
    status: 'queued',
    createdAt: Date.now() - 3200000,
  },
  {
    id: generateId(),
    content: '高并发下的限流策略是什么？熔断机制是怎么实现的？',
    asker: '张伟',
    source: 'online',
    topic: '技术实现',
    heat: 19,
    status: 'pending',
    createdAt: Date.now() - 2800000,
  },
  {
    id: generateId(),
    content: '商业模式上，是订阅制还是按使用量收费？两者的转化率数据如何？',
    asker: '陈静',
    source: 'onsite',
    topic: '商业模式',
    heat: 33,
    status: 'pending',
    createdAt: Date.now() - 2400000,
  },
  {
    id: generateId(),
    content: '请问刚才讲的微服务拆分原则，在团队规模较小时（10人以内）是否适用？有没有折中方案？',
    asker: '赵强',
    source: 'online',
    topic: '团队协作',
    heat: 12,
    status: 'pending',
    createdAt: Date.now() - 2000000,
  },
  {
    id: generateId(),
    content: 'AI辅助编码会对传统的程序员职业发展路径产生什么影响？新人应该如何规划？',
    asker: '刘洋',
    source: 'onsite',
    topic: '行业趋势',
    heat: 56,
    status: 'answered',
    createdAt: Date.now() - 5400000,
  },
];

const initialAnswers: Record<string, AnswerRecord> = {
  [initialQuestions[5].id]: {
    questionId: initialQuestions[5].id,
    summary:
      'AI辅助编码会显著提升初级任务的效率，但不会替代程序员。核心能力转向系统设计、问题定义和跨领域协作。建议新人：1）扎实掌握基础原理；2）培养架构思维；3）主动拥抱AI工具提升效率；4）深耕某个业务领域建立壁垒。',
    followUpMaterials:
      '推荐《设计数据密集型应用》、《重构》；关注 GitHub Copilot / Cursor 实战教程；后续会在公众号发布《AI时代工程师能力模型》长文。',
    answeredAt: Date.now() - 5000000,
    speakerName: '周老师',
  },
};

const JACCARD_THRESHOLD = 0.35;

const tokenize = (text: string): Set<string> => {
  const cleaned = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' ');
  const tokens = new Set<string>();
  const chineseChars = cleaned.match(/[\u4e00-\u9fa5]/g) || [];
  for (let i = 0; i < chineseChars.length - 1; i++) {
    tokens.add(chineseChars[i] + chineseChars[i + 1]);
  }
  cleaned
    .split(/\s+/)
    .filter((w) => w.length >= 2 && /[a-z0-9]/.test(w))
    .forEach((w) => tokens.add(w));
  return tokens;
};

const jaccardSimilarity = (a: Set<string>, b: Set<string>): number => {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  a.forEach((t) => {
    if (b.has(t)) intersection++;
  });
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

export const useQAStore = create<QAStore>((set, get) => ({
  event: createInitialEvent(),
  questions: initialQuestions,
  answers: initialAnswers,
  sortMode: 'heat',
  filterMode: 'all',
  selectedTopic: null,

  setEventTitle: (title) =>
    set((s) => ({ event: { ...s.event, title } })),

  addTopic: (topic) =>
    set((s) => {
      if (s.event.topics.includes(topic)) return {};
      return { event: { ...s.event, topics: [...s.event.topics, topic] } };
    }),

  removeTopic: (topic) =>
    set((s) => ({
      event: { ...s.event, topics: s.event.topics.filter((t) => t !== topic) },
    })),

  addQuestion: ({ content, asker, source, topic }) =>
    set((s) => ({
      questions: [
        ...s.questions,
        {
          id: generateId(),
          content,
          asker: asker || '匿名观众',
          source,
          topic,
          heat: 1,
          status: 'pending',
          createdAt: Date.now(),
        },
      ],
    })),

  voteQuestion: (id) =>
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === id ? { ...q, heat: q.heat + 1 } : q
      ),
    })),

  updateQuestionStatus: (id, status) =>
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === id ? { ...q, status } : q
      ),
    })),

  updateQuestionTopic: (id, topic) =>
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === id ? { ...q, topic } : q
      ),
    })),

  deleteQuestion: (id) =>
    set((s) => {
      const newAnswers = { ...s.answers };
      delete newAnswers[id];
      return {
        questions: s.questions.filter((q) => q.id !== id),
        answers: newAnswers,
      };
    }),

  findSimilar: (id) => {
    const { questions } = get();
    const target = questions.find((q) => q.id === id);
    if (!target) return [];
    const targetTokens = tokenize(target.content);
    const result: Array<{ id: string; score: number }> = [];
    for (const q of questions) {
      if (q.id === id) continue;
      if (q.status === 'merged' || q.status === 'answered') continue;
      const score = jaccardSimilarity(targetTokens, tokenize(q.content));
      if (score >= JACCARD_THRESHOLD) {
        result.push({ id: q.id, score });
      }
    }
    return result.sort((a, b) => b.score - a.score).map((r) => r.id);
  },

  mergeQuestions: (targetId, sourceIds) =>
    set((s) => {
      const targetQ = s.questions.find((q) => q.id === targetId);
      if (!targetQ) return {};
      const sourceQs = s.questions.filter((q) => sourceIds.includes(q.id));
      const totalHeat = sourceQs.reduce((sum, q) => sum + q.heat, 0) + targetQ.heat;
      return {
        questions: s.questions.map((q) => {
          if (q.id === targetId) {
            return {
              ...q,
              heat: totalHeat,
              mergedFrom: [...(q.mergedFrom || []), ...sourceIds],
              content:
                q.content +
                sourceQs.map((sq) => `\n\n—— 合并自 ${sq.asker}（${sq.source === 'onsite' ? '现场' : '线上'}）：\n${sq.content}`).join(''),
            };
          }
          if (sourceIds.includes(q.id)) {
            return { ...q, status: 'merged' as QuestionStatus };
          }
          return q;
        }),
      };
    }),

  setSortMode: (mode) => set({ sortMode: mode }),
  setFilterMode: (mode) => set({ filterMode: mode }),
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),

  recordAnswer: ({ questionId, summary, followUpMaterials, speakerName }) =>
    set((s) => ({
      answers: {
        ...s.answers,
        [questionId]: {
          questionId,
          summary,
          followUpMaterials,
          answeredAt: Date.now(),
          speakerName,
        },
      },
      questions: s.questions.map((q) =>
        q.id === questionId ? { ...q, status: 'answered' as QuestionStatus } : q
      ),
    })),

  updateAnswer: (questionId, data) =>
    set((s) => ({
      answers: {
        ...s.answers,
        [questionId]: { ...s.answers[questionId], ...data },
      },
    })),

  getFilteredQuestions: () => {
    const { questions, sortMode, filterMode, selectedTopic } = get();
    let list = questions.filter((q) => q.status !== 'merged');
    if (selectedTopic) {
      list = list.filter((q) => q.topic === selectedTopic);
    }
    switch (filterMode) {
      case 'pending':
        list = list.filter((q) => q.status === 'pending');
        break;
      case 'queued':
        list = list.filter((q) => q.status === 'queued' || q.status === 'answering');
        break;
      case 'answered':
        list = list.filter((q) => q.status === 'answered');
        break;
      case 'unanswered':
        list = list.filter((q) => q.status !== 'answered');
        break;
      case 'onsite':
        list = list.filter((q) => q.source === 'onsite');
        break;
      case 'online':
        list = list.filter((q) => q.source === 'online');
        break;
    }
    switch (sortMode) {
      case 'heat':
        list = [...list].sort((a, b) => b.heat - a.heat);
        break;
      case 'time':
        list = [...list].sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'topic':
        list = [...list].sort((a, b) => a.topic.localeCompare(b.topic));
        break;
    }
    return list;
  },

  getAnsweredWithRecords: () => {
    const { questions, answers } = get();
    return questions
      .filter((q) => q.status === 'answered' && answers[q.id])
      .map((q) => ({ question: q, answer: answers[q.id] }));
  },

  exportMinutes: () => {
    const { event, getAnsweredWithRecords, questions, answers } = get();
    const answeredList = getAnsweredWithRecords();
    const unansweredList = questions.filter(
      (q) => q.status !== 'answered' && q.status !== 'merged'
    );

    const formatTime = (ts: number) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
        d.getMinutes()
      ).padStart(2, '0')}`;
    };

    const sourceLabel = (s: string) => (s === 'onsite' ? '现场' : '线上');
    const statusLabel = (st: string) =>
      ({ pending: '待处理', queued: '队列中', answering: '回答中', answered: '已回答', merged: '已合并' }[st] || st);

    const lines: string[] = [];
    lines.push(`# ${event.title} — 问答纪要`);
    lines.push('');
    lines.push(`> 生成时间：${formatTime(Date.now())}`);
    lines.push(`> 活动主题：${event.topics.join('、')}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(`## 概览`);
    lines.push('');
    lines.push(`- 总提问数：${questions.filter(q => q.status !== 'merged').length}`);
    lines.push(`- 已回答：${answeredList.length}`);
    lines.push(`- 待跟进：${unansweredList.length}`);
    lines.push(`- 现场提问：${questions.filter(q => q.source === 'onsite' && q.status !== 'merged').length}`);
    lines.push(`- 线上提问：${questions.filter(q => q.source === 'online' && q.status !== 'merged').length}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(`## 一、已回答问题（${answeredList.length}）`);
    lines.push('');

    answeredList.forEach((item, idx) => {
      const { question: q, answer: a } = item;
      lines.push(`### ${idx + 1}. [${q.topic}] ${q.content.slice(0, 30)}${q.content.length > 30 ? '…' : ''}`);
      lines.push('');
      lines.push(`- **提问者**：${q.asker}（${sourceLabel(q.source)}）　热度：${q.heat}`);
      lines.push(`- **提问时间**：${formatTime(q.createdAt)}`);
      lines.push('');
      lines.push(`**问题原文**：`);
      lines.push('');
      lines.push(`> ${q.content}`);
      lines.push('');
      lines.push(`**讲者回应（${a.speakerName || '讲者'} · ${formatTime(a.answeredAt)}）**：`);
      lines.push('');
      lines.push(a.summary);
      lines.push('');
      if (a.followUpMaterials && a.followUpMaterials.trim()) {
        lines.push(`📚 **课后补充资料 / 待办**：`);
        lines.push('');
        lines.push(a.followUpMaterials);
        lines.push('');
      }
      lines.push('---');
      lines.push('');
    });

    lines.push(`## 二、待跟进问题（${unansweredList.length}）`);
    lines.push('');
    if (unansweredList.length === 0) {
      lines.push('所有问题均已回答完毕！');
      lines.push('');
    } else {
      unansweredList.forEach((q, idx) => {
        lines.push(`${idx + 1}. **[${q.topic}]** ${q.content}`);
        lines.push(`   - 提问者：${q.asker}（${sourceLabel(q.source)}）　热度：${q.heat}　状态：${statusLabel(q.status)}`);
        lines.push('');
      });
    }

    const withFollowUp = answeredList.filter(
      (item) => item.answer.followUpMaterials && item.answer.followUpMaterials.trim()
    );
    if (withFollowUp.length > 0) {
      lines.push('---');
      lines.push('');
      lines.push(`## 三、课后资料 / 待办汇总`);
      lines.push('');
      withFollowUp.forEach((item, idx) => {
        lines.push(`${idx + 1}. **关于「${item.question.content.slice(0, 20)}…」**`);
        lines.push('');
        lines.push(`   ${item.answer.followUpMaterials}`);
        lines.push('');
      });
    }

    return lines.join('\n');
  },

  exportFollowupMinutes: () => {
    const { event, getAnsweredWithRecords } = get();
    const answeredList = getAnsweredWithRecords().filter(
      (item) => item.answer.followUpMaterials && item.answer.followUpMaterials.trim()
    );

    const formatTime = (ts: number) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
        d.getMinutes()
      ).padStart(2, '0')}`;
    };

    const sourceLabel = (s: string) => (s === 'onsite' ? '现场' : '线上');

    const lines: string[] = [];
    lines.push(`# ${event.title} — 课后资料 / 待办汇总`);
    lines.push('');
    lines.push(`> 生成时间：${formatTime(Date.now())}`);
    lines.push(`> 仅包含有课后补充资料的回答（共 ${answeredList.length} 条）`);
    lines.push('');
    lines.push('---');
    lines.push('');

    answeredList.forEach((item, idx) => {
      const { question: q, answer: a } = item;
      lines.push(`### ${idx + 1}. [${q.topic}] ${q.content.slice(0, 30)}${q.content.length > 30 ? '…' : ''}`);
      lines.push('');
      lines.push(`- **提问者**：${q.asker}（${sourceLabel(q.source)}）`);
      lines.push(`- **讲者**：${a.speakerName || '讲者'}`);
      lines.push('');
      lines.push(`**回应摘要**：${a.summary}`);
      lines.push('');
      lines.push(`📚 **课后补充资料 / 待办**：`);
      lines.push('');
      lines.push(a.followUpMaterials);
      lines.push('');
      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  },

  resetAll: () =>
    set({
      event: createInitialEvent(),
      questions: [],
      answers: {},
      sortMode: 'heat',
      filterMode: 'all',
      selectedTopic: null,
    }),
}));
