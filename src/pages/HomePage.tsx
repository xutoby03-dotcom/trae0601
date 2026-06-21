import { useNavigate } from 'react-router-dom';
import { QrCode, Settings, MonitorPlay, ChevronRight } from 'lucide-react';
import { useQAStore } from '../store/qaStore';
import { Card } from '../components/Card';
import '../styles/pages.css';

export default function HomePage() {
  const navigate = useNavigate();
  const eventTitle = useQAStore((s) => s.event.title);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">提问接力板</h1>
        <p className="home-subtitle">公开课问答管理系统</p>
      </header>

      <main className="home-main">
        <div className="home-cards-grid">
          <Card padding="lg" className="home-entry-card" onClick={() => navigate('/submit')}>
            <div className="home-entry-icon qrcode">
              <QrCode size={36} strokeWidth={1.8} />
            </div>
            <h2 className="home-entry-title">观众提交问题</h2>
            <p className="home-entry-desc">扫码或点击进入提问</p>
            <ChevronRight size={20} style={{ color: 'var(--color-text-muted)' }} />
          </Card>

          <Card padding="lg" className="home-entry-card" onClick={() => navigate('/host')}>
            <div className="home-entry-icon settings">
              <Settings size={36} strokeWidth={1.8} />
            </div>
            <h2 className="home-entry-title">主持人控制台</h2>
            <p className="home-entry-desc">进入管理后台整理问答队列</p>
            <ChevronRight size={20} style={{ color: 'var(--color-text-muted)' }} />
          </Card>
        </div>

        <div className="home-small-grid">
          <Card padding="lg" className="home-display-card" onClick={() => navigate('/display')}>
            <div className="home-display-left">
              <div className="home-display-icon">
                <MonitorPlay size={24} strokeWidth={1.8} />
              </div>
              <div className="home-display-text">
                <h3>问答展示大屏</h3>
                <p>实时展示热门问题与问答进度</p>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--color-text-muted)' }} />
          </Card>
        </div>
      </main>

      <footer className="home-footer">当前活动：{eventTitle}</footer>
    </div>
  );
}
