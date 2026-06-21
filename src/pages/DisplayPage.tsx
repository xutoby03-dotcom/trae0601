import { useEffect, useMemo, useState } from 'react';
import { Mic, Sparkles, MapPin, Monitor, Clock, ArrowRight, MessageCircle, CheckCircle2 } from 'lucide-react';
import '../styles/pages.css';
import { useQAStore } from '../store/qaStore';
import { HeatBadge } from '../components/HeatBadge';
import { SourceBadge } from '../components/SourceBadge';
import { Badge } from '../components/Badge';

export default function DisplayPage() {
  const event = useQAStore((s) => s.event);
  const questions = useQAStore((s) => s.questions);
  const answers = useQAStore((s) => s.answers);
  const getAnsweredWithRecords = useQAStore((s) => s.getAnsweredWithRecords);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const queuedList = useMemo(
    () =>
      questions
        .filter((q) => q.status === 'queued' || q.status === 'answering')
        .sort((a, b) => b.heat - a.heat)
        .slice(0, 6),
    [questions]
  );

  const currentQ = useMemo(
    () => questions.find((q) => q.status === 'answering') || null,
    [questions]
  );

  const latestAnswered = useMemo(
    () => getAnsweredWithRecords().sort((a, b) => b.answer.answeredAt - a.answer.answeredAt).slice(0, 3),
    [getAnsweredWithRecords]
  );

  const stats = useMemo(() => {
    const all = questions.filter((q) => q.status !== 'merged');
    return {
      total: all.length,
      onsite: all.filter((q) => q.source === 'onsite').length,
      online: all.filter((q) => q.source === 'online').length,
      answered: all.filter((q) => q.status === 'answered').length,
      pending: all.filter((q) => q.status !== 'answered').length,
      avgHeat: all.length ? Math.round(all.reduce((s, q) => s + q.heat, 0) / all.length) : 0,
    };
  }, [questions]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(
      d.getSeconds()
    ).padStart(2, '0')}`;
  };

  const timeAgo = (ts: number) => {
    const diff = Math.max(0, Math.floor((now - ts) / 1000));
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    return `${Math.floor(diff / 3600)}小时前`;
  };

  return (
    <div className="display-page">
      <header className="display-header">
        <div className="display-header-left">
          <div className="display-logo">
            <MessageCircle size={28} />
          </div>
          <div>
            <div className="display-subtitle">提问接力板 · 实时大屏</div>
            <h1 className="display-title">{event.title}</h1>
          </div>
        </div>
        <div className="display-header-right">
          <div className="display-clock">
            <Clock size={18} />
            <span>{formatTime(now)}</span>
          </div>
        </div>
      </header>

      <div className="display-stats-bar">
        <div className="ds-item">
          <span className="ds-label">总提问</span>
          <span className="ds-value">{stats.total}</span>
        </div>
        <div className="ds-divider" />
        <div className="ds-item">
          <MapPin size={16} className="ds-icon-onsite" />
          <span className="ds-label">现场</span>
          <span className="ds-value">{stats.onsite}</span>
        </div>
        <div className="ds-item">
          <Monitor size={16} className="ds-icon-online" />
          <span className="ds-label">线上</span>
          <span className="ds-value">{stats.online}</span>
        </div>
        <div className="ds-divider" />
        <div className="ds-item">
          <CheckCircle2 size={16} className="ds-icon-success" />
          <span className="ds-label">已回答</span>
          <span className="ds-value ds-value-success">{stats.answered}</span>
        </div>
        <div className="ds-item">
          <Sparkles size={16} className="ds-icon-accent" />
          <span className="ds-label">均热度</span>
          <span className="ds-value">{stats.avgHeat}</span>
        </div>
      </div>

      <div className="display-main">
        <section className="display-section display-current">
          <div className="section-head">
            <Mic size={20} />
            <h2>🎙 正在回答</h2>
          </div>
          {currentQ ? (
            <div className="current-question-card">
              <div className="cq-pulse" />
              <div className="cq-body">
                <div className="cq-meta">
                  <SourceBadge source={currentQ.source} />
                  <Badge variant="primary" showDot={false}>{currentQ.topic}</Badge>
                  <HeatBadge count={currentQ.heat} />
                  <span>— {currentQ.asker}</span>
                </div>
                <div className="cq-content">{currentQ.content}</div>
              </div>
            </div>
          ) : (
            <div className="display-empty">
              <Mic size={48} className="de-icon" />
              <div className="de-title">等待主持人安排问题上台</div>
              <div className="de-desc">队列中的问题将从这里依次展示回答</div>
            </div>
          )}
        </section>

        <section className="display-section display-queue">
          <div className="section-head">
            <Sparkles size={20} />
            <h2>🔥 回答队列 · 按热度排序</h2>
          </div>
          {queuedList.length === 0 ? (
            <div className="display-empty small">
              <div className="de-title">队列暂空</div>
            </div>
          ) : (
            <div className="queue-list">
              {queuedList.map((q, idx) => (
                <div key={q.id} className={`queue-item ${idx === 0 && !currentQ ? 'next' : ''}`}>
                  <div className="qi-rank">{idx === 0 && !currentQ ? '→' : idx + 1}</div>
                  <div className="qi-body">
                    <div className="qi-meta">
                      <SourceBadge source={q.source} showIcon />
                      <HeatBadge count={q.heat} />
                      <span className="qi-time">{timeAgo(q.createdAt)}</span>
                    </div>
                    <div className="qi-content">{q.content}</div>
                    <div className="qi-footer">
                      <Badge variant="primary" showDot={false}>{q.topic}</Badge>
                      <span>— {q.asker}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="display-section display-answered">
          <div className="section-head">
            <CheckCircle2 size={20} />
            <h2>✅ 已回答回顾</h2>
          </div>
          {latestAnswered.length === 0 ? (
            <div className="display-empty small">
              <div className="de-title">暂无回答记录</div>
            </div>
          ) : (
            <div className="answered-feed">
              {latestAnswered.map((item, idx) => (
                <div key={item.question.id} className="answered-feed-item">
                  <div className="afi-head">
                    <span className="afi-num">#{idx + 1}</span>
                    <Badge variant="primary" showDot={false}>{item.question.topic}</Badge>
                    <SourceBadge source={item.question.source} />
                    <span className="afi-asker">{item.question.asker}</span>
                  </div>
                  <div className="afi-q">
                    <ArrowRight size={14} />
                    <span>{item.question.content.length > 50 ? item.question.content.slice(0, 50) + '…' : item.question.content}</span>
                  </div>
                  <div className="afi-a">
                    <strong>{item.answer.speakerName || '讲者'}：</strong>
                    <span>
                      {item.answer.summary.length > 80
                        ? item.answer.summary.slice(0, 80) + '…'
                        : item.answer.summary}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="display-footer">
        <span>📱 扫码提交问题：</span>
        <code>{window.location.origin}/submit</code>
        <span className="footer-dot">·</span>
        <span>当前排队 {queuedList.length} 条 · 已完成 {stats.answered} 条</span>
      </footer>
    </div>
  );
}
