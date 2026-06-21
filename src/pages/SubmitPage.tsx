import { useState, useMemo } from 'react';
import { CheckCircle2, Flame, Send, RotateCcw } from 'lucide-react';
import { useQAStore } from '../store/qaStore';
import type { QuestionSource } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import '../styles/pages.css';

export default function SubmitPage() {
  const event = useQAStore((s) => s.event);
  const questions = useQAStore((s) => s.questions);
  const addQuestion = useQAStore((s) => s.addQuestion);

  const [content, setContent] = useState('');
  const [topic, setTopic] = useState(event.topics[0] || '');
  const [asker, setAsker] = useState('');
  const [source, setSource] = useState<QuestionSource>('onsite');
  const [submitted, setSubmitted] = useState(false);

  const hotQuestions = useMemo(() => {
    return questions
      .filter((q) => q.status !== 'answered' && q.status !== 'merged')
      .sort((a, b) => b.heat - a.heat)
      .slice(0, 5);
  }, [questions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addQuestion({
      content: content.trim(),
      asker: asker.trim(),
      source,
      topic,
    });

    setSubmitted(true);
  };

  const handleContinue = () => {
    setContent('');
    setAsker('');
    setSource('onsite');
    setTopic(event.topics[0] || '');
    setSubmitted(false);
  };

  return (
    <div className="submit-container">
      <div className="submit-banner">
        <h1>{event.title}</h1>
      </div>

      <div className="submit-content">
        <Card padding="lg" className="submit-form-card">
          {submitted ? (
            <div className="submit-success">
              <div className="submit-success-icon">
                <CheckCircle2 size={32} strokeWidth={1.8} />
              </div>
              <h2 className="submit-success-title">提交成功！</h2>
              <p className="submit-success-desc">您的问题已进入等待队列，主持人会尽快处理</p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleContinue}
                leftIcon={<RotateCcw size={18} />}
              >
                继续提问
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="submit-form-title">提交您的问题</h2>

              <div className="form-group">
                <label className="form-label">
                  问题内容<span className="required">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="请描述您的问题…"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  选择主题<span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                >
                  {event.topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">您的称呼（可选）</label>
                <input
                  type="text"
                  className="form-input"
                  value={asker}
                  onChange={(e) => setAsker(e.target.value)}
                  placeholder="匿名观众"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  来源<span className="required">*</span>
                </label>
                <div className="form-radio-group">
                  <label className="form-radio-item">
                    <input
                      type="radio"
                      name="source"
                      value="onsite"
                      checked={source === 'onsite'}
                      onChange={() => setSource('onsite')}
                    />
                    <span className="form-radio-label">现场观众</span>
                  </label>
                  <label className="form-radio-item">
                    <input
                      type="radio"
                      name="source"
                      value="online"
                      checked={source === 'online'}
                      onChange={() => setSource('online')}
                    />
                    <span className="form-radio-label">线上观众</span>
                  </label>
                </div>
              </div>

              <div className="submit-actions">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!content.trim()}
                  leftIcon={<Send size={18} />}
                >
                  提交问题
                </Button>
              </div>
            </form>
          )}
        </Card>

        <Card padding="lg" className="hotlist-card">
          <h3>
            <Flame size={20} className="hotlist-icon" />
            实时热度榜
          </h3>
          {hotQuestions.length === 0 ? (
            <div className="hotlist-empty">暂无问题，成为第一个提问的人吧～</div>
          ) : (
            <div className="hotlist-items">
              {hotQuestions.map((q, idx) => (
                <div key={q.id} className="hotlist-item">
                  <div className={`hotlist-rank ${idx === 0 ? 'top1' : idx === 1 ? 'top2' : idx === 2 ? 'top3' : ''}`}>
                    {idx + 1}
                  </div>
                  <div className="hotlist-content">
                    <p className="hotlist-text">{q.content}</p>
                    <div className="hotlist-meta">
                      <Badge variant={q.source === 'onsite' ? 'onsite' : 'online'} showDot={false}>
                        {q.source === 'onsite' ? '现场' : '线上'}
                      </Badge>
                      <Badge variant="primary" showDot={false}>
                        {q.topic}
                      </Badge>
                      <span className="hotlist-heat">
                        <Flame size={14} />
                        {q.heat}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
