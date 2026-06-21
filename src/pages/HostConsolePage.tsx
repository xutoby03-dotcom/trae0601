import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowUpDown,
  ListOrdered,
  Merge,
  Trash2,
  MessageSquarePlus,
  Mic,
  CheckCircle2,
  Clock,
  Download,
  Maximize2,
  Search,
  Filter,
  Users,
  MapPin,
  Monitor,
  Sparkles,
  Pencil,
  X,
  ChevronRight,
  FileText,
} from 'lucide-react';
import '../styles/pages.css';
import { useQAStore } from '../store/qaStore';
import type { Question, SortMode, FilterMode, QuestionStatus, AnswerRecord } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Tag } from '../components/Tag';
import { Modal } from '../components/Modal';
import { SourceBadge } from '../components/SourceBadge';
import { HeatBadge } from '../components/HeatBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Badge } from '../components/Badge';

type Tab = 'queue' | 'answered' | 'stats';

const sortOptions: { value: SortMode; label: string; icon: React.ReactNode }[] = [
  { value: 'heat', label: '按热度', icon: <Sparkles size={14} /> },
  { value: 'time', label: '按时间', icon: <Clock size={14} /> },
  { value: 'topic', label: '按主题', icon: <ListOrdered size={14} /> },
];

const filterOptions: { value: FilterMode; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'unanswered', label: '待回答' },
  { value: 'pending', label: '待处理' },
  { value: 'queued', label: '队列中' },
  { value: 'answered', label: '已回答' },
  { value: 'onsite', label: '仅现场' },
  { value: 'online', label: '仅线上' },
];

export default function HostConsolePage() {
  const navigate = useNavigate();

  const event = useQAStore((s) => s.event);
  const questions = useQAStore((s) => s.questions);
  const answers = useQAStore((s) => s.answers);
  const sortMode = useQAStore((s) => s.sortMode);
  const filterMode = useQAStore((s) => s.filterMode);
  const selectedTopic = useQAStore((s) => s.selectedTopic);

  const setEventTitle = useQAStore((s) => s.setEventTitle);
  const setSortMode = useQAStore((s) => s.setSortMode);
  const setFilterMode = useQAStore((s) => s.setFilterMode);
  const setSelectedTopic = useQAStore((s) => s.setSelectedTopic);
  const updateQuestionStatus = useQAStore((s) => s.updateQuestionStatus);
  const updateQuestionTopic = useQAStore((s) => s.updateQuestionTopic);
  const deleteQuestion = useQAStore((s) => s.deleteQuestion);
  const findSimilar = useQAStore((s) => s.findSimilar);
  const mergeQuestions = useQAStore((s) => s.mergeQuestions);
  const recordAnswer = useQAStore((s) => s.recordAnswer);
  const updateAnswer = useQAStore((s) => s.updateAnswer);
  const getFilteredQuestions = useQAStore((s) => s.getFilteredQuestions);
  const getAnsweredWithRecords = useQAStore((s) => s.getAnsweredWithRecords);
  const exportMinutes = useQAStore((s) => s.exportMinutes);
  const exportFollowupMinutes = useQAStore((s) => s.exportFollowupMinutes);
  const voteQuestion = useQAStore((s) => s.voteQuestion);

  const [tab, setTab] = useState<Tab>('queue');
  const [searchText, setSearchText] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(event.title);

  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeTarget, setMergeTarget] = useState<Question | null>(null);
  const [mergeCandidates, setMergeCandidates] = useState<string[]>([]);
  const [mergeSelected, setMergeSelected] = useState<string[]>([]);

  const [answerModalOpen, setAnswerModalOpen] = useState(false);
  const [answerTarget, setAnswerTarget] = useState<Question | null>(null);
  const [answerSummary, setAnswerSummary] = useState('');
  const [answerFollowup, setAnswerFollowup] = useState('');
  const [answerSpeaker, setAnswerSpeaker] = useState('');
  const [answerEditing, setAnswerEditing] = useState(false);

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [topicTarget, setTopicTarget] = useState<Question | null>(null);
  const [topicDraft, setTopicDraft] = useState('');

  const [followupOnly, setFollowupOnly] = useState(false);

  const filteredList = useMemo(() => {
    const list = getFilteredQuestions();
    if (!searchText.trim()) return list;
    const kw = searchText.trim().toLowerCase();
    return list.filter(
      (q) =>
        q.content.toLowerCase().includes(kw) ||
        q.asker.toLowerCase().includes(kw) ||
        q.topic.toLowerCase().includes(kw)
    );
  }, [getFilteredQuestions, searchText]);

  const queueList = useMemo(
    () => filteredList.filter((q) => q.status !== 'answered'),
    [filteredList]
  );

  const stats = useMemo(() => {
    const all = questions.filter((q) => q.status !== 'merged');
    return {
      total: all.length,
      onsite: all.filter((q) => q.source === 'onsite').length,
      online: all.filter((q) => q.source === 'online').length,
      answered: all.filter((q) => q.status === 'answered').length,
      pending: all.filter((q) => q.status === 'pending').length,
      queued: all.filter((q) => q.status === 'queued' || q.status === 'answering').length,
      avgHeat: all.length ? Math.round(all.reduce((s, q) => s + q.heat, 0) / all.length) : 0,
      topTopic:
        event.topics
          .map((t) => ({
            t,
            n: all.filter((q) => q.topic === t).length,
          }))
          .sort((a, b) => b.n - a.n)[0]?.t || '—',
    };
  }, [questions, event.topics]);

  const answeredRecords = useMemo(() => getAnsweredWithRecords(), [getAnsweredWithRecords]);

  const answeredFilteredBySearch = useMemo(() => {
    const answeredQs = filteredList.filter((q) => q.status === 'answered');
    return answeredQs
      .map((q) => {
        const a = answers[q.id];
        if (!a) return null;
        return { question: q, answer: a };
      })
      .filter((x): x is { question: Question; answer: AnswerRecord } => x !== null);
  }, [filteredList, answers]);

  const filteredAnsweredRecords = useMemo(
    () =>
      followupOnly
        ? answeredFilteredBySearch.filter(
            (r) => r.answer.followUpMaterials && r.answer.followUpMaterials.trim()
          )
        : answeredFilteredBySearch,
    [answeredFilteredBySearch, followupOnly]
  );

  useEffect(() => {
    setTitleDraft(event.title);
  }, [event.title]);

  const openMergeModal = (q: Question) => {
    const similarIds = findSimilar(q.id);
    setMergeTarget(q);
    setMergeCandidates(similarIds);
    setMergeSelected(similarIds.slice(0, 3));
    setMergeModalOpen(true);
  };

  const confirmMerge = () => {
    if (!mergeTarget || mergeSelected.length === 0) return;
    mergeQuestions(mergeTarget.id, mergeSelected);
    setMergeModalOpen(false);
    setMergeTarget(null);
    setMergeSelected([]);
  };

  const openAnswerModal = (q: Question) => {
    setAnswerTarget(q);
    setAnswerSummary('');
    setAnswerFollowup('');
    setAnswerSpeaker('');
    setAnswerEditing(false);
    setAnswerModalOpen(true);
    if (q.status !== 'answering') {
      updateQuestionStatus(q.id, 'answering');
    }
  };

  const openEditAnswerModal = (q: Question) => {
    const existing = answers[q.id];
    if (!existing) return;
    setAnswerTarget(q);
    setAnswerSummary(existing.summary);
    setAnswerFollowup(existing.followUpMaterials);
    setAnswerSpeaker(existing.speakerName || '');
    setAnswerEditing(true);
    setAnswerModalOpen(true);
  };

  const confirmAnswer = () => {
    if (!answerTarget) return;
    if (answerEditing) {
      updateAnswer(answerTarget.id, {
        summary: answerSummary.trim(),
        followUpMaterials: answerFollowup.trim(),
        speakerName: answerSpeaker.trim(),
      });
    } else {
      recordAnswer({
        questionId: answerTarget.id,
        summary: answerSummary.trim(),
        followUpMaterials: answerFollowup.trim(),
        speakerName: answerSpeaker.trim(),
      });
    }
    setAnswerModalOpen(false);
    setAnswerTarget(null);
    setAnswerEditing(false);
  };

  const openTopicModal = (q: Question) => {
    setTopicTarget(q);
    setTopicDraft(q.topic);
    setTopicModalOpen(true);
  };

  const confirmTopicChange = () => {
    if (!topicTarget) return;
    updateQuestionTopic(topicTarget.id, topicDraft);
    setTopicModalOpen(false);
    setTopicTarget(null);
  };

  const handleExport = () => {
    const content = followupOnly ? exportFollowupMinutes() : exportMinutes();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(
      today.getDate()
    ).padStart(2, '0')}`;
    const suffix = followupOnly ? '-课后资料汇总' : '-问答纪要';
    a.download = `${event.title}${suffix}-${dateStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getQuestionById = (id: string) => questions.find((q) => q.id === id);

  const getStatusActions = (q: Question) => {
    const actions: { label: string; status: QuestionStatus; variant: 'primary' | 'secondary' | 'ghost'; icon: React.ReactNode }[] = [];
    switch (q.status) {
      case 'pending':
        actions.push({ label: '加入队列', status: 'queued', variant: 'primary', icon: <MessageSquarePlus size={14} /> });
        break;
      case 'queued':
        actions.push({ label: '上台回答', status: 'answering', variant: 'primary', icon: <Mic size={14} /> });
        actions.push({ label: '退回待处理', status: 'pending', variant: 'ghost', icon: <Clock size={14} /> });
        break;
      case 'answering':
        actions.push({ label: '退回队列', status: 'queued', variant: 'secondary', icon: <ChevronRight size={14} /> });
        break;
      case 'answered':
        break;
    }
    return actions;
  };

  return (
    <div className="host-page">
      <header className="host-header">
        <div className="host-header-inner">
          <div className="host-brand">
            <div className="host-brand-icon">
              <LayoutDashboard size={22} />
            </div>
            <div className="host-brand-text">
              <div className="host-brand-sub">主持人控制台</div>
              {editingTitle ? (
                <div className="host-title-edit">
                  <input
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEventTitle(titleDraft);
                        setEditingTitle(false);
                      }
                    }}
                    autoFocus
                  />
                  <button onClick={() => setEditingTitle(false)}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <h1 className="host-title" onClick={() => setEditingTitle(true)}>
                  {event.title}
                  <Pencil size={14} />
                </h1>
              )}
            </div>
          </div>
          <div className="host-header-actions">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Maximize2 size={14} />}
              onClick={() => window.open('/display', '_blank')}
            >
              投屏大屏
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={handleExport}
            >
              导出纪要
            </Button>
          </div>
        </div>

        <div className="host-stats">
          <div className="stat-item">
            <div className="stat-icon primary"><Users size={18} /></div>
            <div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">总提问</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon onsite"><MapPin size={18} /></div>
            <div>
              <div className="stat-value">{stats.onsite}</div>
              <div className="stat-label">现场</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon online"><Monitor size={18} /></div>
            <div>
              <div className="stat-value">{stats.online}</div>
              <div className="stat-label">线上</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon warning"><Clock size={18} /></div>
            <div>
              <div className="stat-value">{stats.queued}</div>
              <div className="stat-label">队列中</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon success"><CheckCircle2 size={18} /></div>
            <div>
              <div className="stat-value">{stats.answered}</div>
              <div className="stat-label">已回答</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon accent"><Sparkles size={18} /></div>
            <div>
              <div className="stat-value">{stats.avgHeat}</div>
              <div className="stat-label">均热度</div>
            </div>
          </div>
        </div>

        <div className="host-tabs">
          <button className={`host-tab ${tab === 'queue' ? 'active' : ''}`} onClick={() => setTab('queue')}>
            <MessageSquarePlus size={15} />
            问答队列 <span className="host-tab-count">{queueList.length}</span>
          </button>
          <button className={`host-tab ${tab === 'answered' ? 'active' : ''}`} onClick={() => setTab('answered')}>
            <CheckCircle2 size={15} />
            已回答 <span className="host-tab-count">{answeredRecords.length}</span>
          </button>
          <button className={`host-tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
            <FileText size={15} />
            纪要预览
          </button>
        </div>
      </header>

      <div className="host-body">
        <aside className="host-sidebar">
          <div className="filter-section">
            <div className="filter-title"><Filter size={14} /> 筛选条件</div>

            <div className="filter-group">
              <div className="filter-group-label">状态</div>
              <div className="filter-chips">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`filter-chip ${filterMode === opt.value ? 'active' : ''}`}
                    onClick={() => setFilterMode(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-group-label">主题分类</div>
              <div className="filter-tags">
                <Tag
                  active={selectedTopic === null}
                  onClick={() => setSelectedTopic(null)}
                >
                  全部主题
                </Tag>
                {event.topics.map((t) => (
                  <Tag
                    key={t}
                    active={selectedTopic === t}
                    onClick={() => setSelectedTopic(selectedTopic === t ? null : t)}
                  >
                    {t}
                  </Tag>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-group-label"><ArrowUpDown size={13} /> 排序方式</div>
              <div className="filter-sort">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`sort-btn ${sortMode === opt.value ? 'active' : ''}`}
                    onClick={() => setSortMode(opt.value)}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-tip">
            <div className="sidebar-tip-title">💡 操作提示</div>
            <ul>
              <li>先将「待处理」问题<strong>加入队列</strong>，再安排上台</li>
              <li>点击<strong>合并相似</strong>将相同主题的问题整合提问</li>
              <li>回答结束后务必<strong>填写回应摘要</strong>，方便生成纪要</li>
              <li>「课后补充资料」会在纪要末尾汇总成待办清单</li>
            </ul>
          </div>
        </aside>

        <main className="host-main">
          <div className="host-toolbar">
            <div className="search-box">
              <Search size={16} />
              <input
                placeholder="搜索问题内容、提问者或主题…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button className="search-clear" onClick={() => setSearchText('')}><X size={14} /></button>
              )}
            </div>
            <div className="toolbar-right">
              <Badge variant="muted" showDot={false}>
                显示 {tab === 'queue' ? queueList.length : filteredList.length} / {questions.filter(q => q.status !== 'merged').length}
              </Badge>
            </div>
          </div>

          {tab === 'queue' && (
            <div className="question-list">
              {queueList.length === 0 ? (
                <Card padding="lg" className="empty-card">
                  <div className="empty-icon">📭</div>
                  <div className="empty-title">暂无待处理问题</div>
                  <div className="empty-desc">调整筛选条件，或等待观众提交新的提问。已回答问题请查看「已回答」标签页</div>
                </Card>
              ) : (
                queueList.map((q, idx) => {
                  const similarIds = findSimilar(q.id);
                  const actions = getStatusActions(q);
                  return (
                    <Card
                      key={q.id}
                      padding="md"
                      className={`question-card qc-${q.status}`}
                    >
                      <div className="qc-index">#{idx + 1}</div>
                      <div className="qc-main">
                        <div className="qc-meta">
                          <SourceBadge source={q.source} />
                          <Badge variant="primary" showDot={false}>
                            {q.topic}
                          </Badge>
                          <HeatBadge count={q.heat} />
                          <StatusBadge status={q.status as any} />
                          <span className="qc-asker">— {q.asker}</span>
                          {q.mergedFrom && q.mergedFrom.length > 0 && (
                            <Badge variant="warning" showDot={false}>
                              合并 {q.mergedFrom.length} 条
                            </Badge>
                          )}
                        </div>
                        <div className="qc-content">{q.content}</div>
                        <div className="qc-actions">
                          <div className="qc-actions-left">
                            {actions.map((act) => (
                              <Button
                                key={act.status}
                                size="sm"
                                variant={act.variant}
                                leftIcon={act.icon}
                                onClick={() => updateQuestionStatus(q.id, act.status)}
                              >
                                {act.label}
                              </Button>
                            ))}
                            {q.status !== 'answered' && (
                              <Button
                                size="sm"
                                variant="primary"
                                leftIcon={<CheckCircle2 size={14} />}
                                onClick={() => openAnswerModal(q)}
                              >
                                {q.status === 'answering' ? '完成回答' : '记录回答'}
                              </Button>
                            )}
                            {similarIds.length > 0 && q.status !== 'answered' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                leftIcon={<Merge size={14} />}
                                onClick={() => openMergeModal(q)}
                              >
                                合并相似 ({similarIds.length})
                              </Button>
                            )}
                          </div>
                          <div className="qc-actions-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              leftIcon={<Sparkles size={14} />}
                              onClick={() => voteQuestion(q.id)}
                            >
                              +1热度
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openTopicModal(q)}
                            >
                              改主题
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              leftIcon={<Trash2 size={14} />}
                              onClick={() => {
                                if (confirm(`确认删除「${q.content.slice(0, 20)}…」？`)) {
                                  deleteQuestion(q.id);
                                }
                              }}
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {tab === 'answered' && (
            <div className="answered-list">
              <div className="answered-toolbar">
                <Badge variant="muted" showDot={false}>
                  {followupOnly
                    ? `${filteredAnsweredRecords.length} / ${answeredFilteredBySearch.length} 条有课后资料`
                    : `共 ${answeredFilteredBySearch.length} 条已回答`}
                </Badge>
                <button
                  className={`followup-toggle ${followupOnly ? 'active' : ''}`}
                  onClick={() => setFollowupOnly(!followupOnly)}
                >
                  📚 只看有课后资料
                </button>
              </div>
              {filteredAnsweredRecords.length === 0 ? (
                <Card padding="lg" className="empty-card">
                  <div className="empty-icon">{followupOnly ? '📚' : '✅'}</div>
                  <div className="empty-title">
                    {followupOnly
                      ? '当前筛选下没有带课后资料的回答'
                      : answeredRecords.length === 0
                      ? '还没有回答记录'
                      : '没有符合条件的回答'}
                  </div>
                  <div className="empty-desc">
                    {followupOnly
                      ? '点击「只看有课后资料」可回到全部，已保留搜索和排序条件'
                      : '调整左侧筛选、搜索词或排序方式'}
                  </div>
                </Card>
              ) : (
                filteredAnsweredRecords.map((item, idx) => (
                  <Card key={item.question.id} padding="md" className="answered-card">
                    <div className="answered-header">
                      <span className="answered-num">#{idx + 1}</span>
                      <Badge variant="primary" showDot={false}>{item.question.topic}</Badge>
                      <SourceBadge source={item.question.source} />
                      <HeatBadge count={item.question.heat} />
                      <span className="answered-asker">— {item.question.asker}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Pencil size={13} />}
                        onClick={() => openEditAnswerModal(item.question)}
                        className="answered-edit-btn"
                      >
                        修改回答
                      </Button>
                    </div>
                    <div className="answered-q">
                      <strong>问：</strong>{item.question.content}
                    </div>
                    <div className="answered-a">
                      <strong>答（{item.answer.speakerName || '讲者'}）：</strong>
                      <p>{item.answer.summary}</p>
                    </div>
                    {item.answer.followUpMaterials && (
                      <div className="answered-follow">
                        📚 <strong>课后补充：</strong>
                        <p>{item.answer.followUpMaterials}</p>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}

          {tab === 'stats' && (
            <Card padding="lg" className="minutes-preview">
              <div className="minutes-preview-header">
                <h3><FileText size={18} /> 纪要预览（导出为 Markdown）</h3>
                <div className="minutes-header-actions">
                  <button
                    className={`followup-toggle ${followupOnly ? 'active' : ''}`}
                    onClick={() => setFollowupOnly(!followupOnly)}
                  >
                    📚 只看有课后资料
                  </button>
                  <Button size="sm" leftIcon={<Download size={14} />} onClick={handleExport}>
                    下载文件
                  </Button>
                </div>
              </div>
              <pre className="markdown-preview">{followupOnly ? exportFollowupMinutes() : exportMinutes()}</pre>
            </Card>
          )}
        </main>
      </div>

      {/* 合并相似问题 Modal */}
      <Modal
        open={mergeModalOpen}
        title={`合并相似提问 — 目标：${mergeTarget?.content.slice(0, 25)}…`}
        onClose={() => setMergeModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setMergeModalOpen(false)}>取消</Button>
            <Button
              variant="primary"
              leftIcon={<Merge size={14} />}
              onClick={confirmMerge}
              disabled={mergeSelected.length === 0}
            >
              合并选中的 {mergeSelected.length} 条
            </Button>
          </>
        }
      >
        {mergeTarget && (
          <div className="merge-modal">
            <div className="merge-target">
              <div className="merge-target-label">📌 保留为目标问题（热度会累加）</div>
              <div className="merge-target-card">
                <div className="qc-meta">
                  <SourceBadge source={mergeTarget.source} />
                  <HeatBadge count={mergeTarget.heat} />
                  <span>— {mergeTarget.asker}</span>
                </div>
                <div className="qc-content">{mergeTarget.content}</div>
              </div>
            </div>

            {mergeCandidates.length > 0 ? (
              <>
                <div className="merge-candidates-title">
                  🔗 检测到 {mergeCandidates.length} 条相似提问，勾选要合并的：
                </div>
                <div className="merge-candidates">
                  {mergeCandidates.map((cid) => {
                    const q = getQuestionById(cid);
                    if (!q) return null;
                    return (
                      <label
                        key={cid}
                        className={`merge-item ${mergeSelected.includes(cid) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={mergeSelected.includes(cid)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMergeSelected([...mergeSelected, cid]);
                            } else {
                              setMergeSelected(mergeSelected.filter((x) => x !== cid));
                            }
                          }}
                        />
                        <div className="merge-item-body">
                          <div className="qc-meta">
                            <SourceBadge source={q.source} />
                            <HeatBadge count={q.heat} />
                            <span>— {q.asker}</span>
                          </div>
                          <div className="merge-item-content">{q.content}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="merge-empty">没有检测到明显相似的提问，你可以手动合并（在队列顶部勾选）。</div>
            )}
          </div>
        )}
      </Modal>

      {/* 记录回答 Modal */}
      <Modal
        open={answerModalOpen}
        title={answerEditing ? '修改讲者回应' : '记录讲者回应'}
        onClose={() => setAnswerModalOpen(false)}
        className="answer-modal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAnswerModalOpen(false)}>取消</Button>
            <Button
              variant="primary"
              leftIcon={<CheckCircle2 size={14} />}
              onClick={confirmAnswer}
              disabled={!answerSummary.trim()}
            >
              {answerEditing ? '保存修改' : '确认完成回答'}
            </Button>
          </>
        }
      >
        {answerTarget && (
          <div className="answer-form">
            <div className="answer-form-q">
              <Badge variant="primary" showDot={false}>{answerTarget.topic}</Badge>
              <SourceBadge source={answerTarget.source} />
              <HeatBadge count={answerTarget.heat} />
              <span className="qc-asker">— {answerTarget.asker}</span>
              <p className="answer-form-q-text">{answerTarget.content}</p>
            </div>

            <div className="form-row">
              <label>讲者姓名（可选）</label>
              <input
                value={answerSpeaker}
                onChange={(e) => setAnswerSpeaker(e.target.value)}
                placeholder="如：张教授"
              />
            </div>

            <div className="form-row">
              <label>回应摘要 <span className="req">*</span></label>
              <textarea
                value={answerSummary}
                onChange={(e) => setAnswerSummary(e.target.value)}
                placeholder="请记录讲者回应的核心观点，会出现在问答纪要中…"
                rows={6}
                required
              />
            </div>

            <div className="form-row">
              <label>📚 课后补充资料 / 待办事项</label>
              <textarea
                value={answerFollowup}
                onChange={(e) => setAnswerFollowup(e.target.value)}
                placeholder="需要课后发送的资料链接、推荐书籍、待跟进问题等，会在纪要末尾汇总"
                rows={4}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* 改主题 Modal */}
      <Modal
        open={topicModalOpen}
        title="修改问题主题"
        onClose={() => setTopicModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setTopicModalOpen(false)}>取消</Button>
            <Button variant="primary" onClick={confirmTopicChange}>确认</Button>
          </>
        }
      >
        {topicTarget && (
          <div className="topic-modal">
            <p className="topic-modal-q">
              {topicTarget.content.slice(0, 60)}{topicTarget.content.length > 60 ? '…' : ''}
            </p>
            <div className="form-row">
              <label>选择或输入主题</label>
              <select value={topicDraft} onChange={(e) => setTopicDraft(e.target.value)}>
                {event.topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                value={topicDraft}
                onChange={(e) => setTopicDraft(e.target.value)}
                placeholder="或输入自定义主题"
                className="mt-8"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
