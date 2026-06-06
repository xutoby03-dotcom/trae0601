import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Download, RefreshCw, Save, Info, Share2, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import ParticleBackground from '@/components/ParticleBackground';
import RadarChart from '@/components/RadarChart';
import DimensionBar from '@/components/DimensionBar';
import ShareCard from '@/components/ShareCard';
import { useTestStore } from '@/store/useTestStore';
import { typeDetails } from '@/data/typeDetails';

export default function Result() {
  const navigate = useNavigate();
  const { result, resetTest, saveToHistory } = useTestStore();
  const [showShare, setShowShare] = useState(false);
  const [saved, setSaved] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  if (!result) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <ParticleBackground />
        <div className="relative z-10 text-center">
          <p className="text-white/60 text-xl mb-6">还没有测试结果</p>
          <button onClick={() => navigate('/test')} className="btn-primary">
            开始测试
          </button>
        </div>
      </div>
    );
  }

  const detail = typeDetails[result.type];

  const handleSave = () => {
    saveToHistory();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownload = async () => {
    if (shareCardRef.current) {
      try {
        const canvas = await html2canvas(shareCardRef.current, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
        });
        const link = document.createElement('a');
        link.download = `MBTI-${result.type}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (e) {
        console.error('Failed to generate image:', e);
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />

      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center glass-card px-4 py-2 rounded-full mb-6">
              <Info className="w-4 h-4 text-neon-cyan mr-2" />
              <span className="text-white/80 text-sm">测试完成！这是你的结果</span>
            </div>

            <div
              className="text-7xl sm:text-9xl font-display font-bold mb-4 animate-pulse-slow"
              style={{
                color: detail.color,
                textShadow: `0 0 60px ${detail.color}60`,
              }}
            >
              {result.type}
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">{detail.name}</h2>
            <p className="text-xl text-white/60 mb-6">「{detail.nickname}」</p>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
              {detail.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="glass-card p-8 animate-slide-up">
              <h3 className="text-xl font-bold text-white mb-6 text-center">
                维度雷达图
              </h3>
              <RadarChart result={result} color={detail.color} />
            </div>

            <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h3 className="text-xl font-bold text-white mb-6 text-center">
                各维度百分比
              </h3>
              <DimensionBar
                labelLeft="外向 E"
                labelRight="内向 I"
                percentage={result.percentages.EI}
                color="#e94560"
                delay={200}
              />
              <DimensionBar
                labelLeft="感觉 S"
                labelRight="直觉 N"
                percentage={result.percentages.SN}
                color="#00d9ff"
                delay={400}
              />
              <DimensionBar
                labelLeft="思考 T"
                labelRight="情感 F"
                percentage={result.percentages.TF}
                color="#a855f7"
                delay={600}
              />
              <DimensionBar
                labelLeft="判断 J"
                labelRight="感知 P"
                percentage={result.percentages.JP}
                color="#00ff88"
                delay={800}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={handleSave}
              className={`btn-primary flex items-center ${
                saved ? 'bg-neon-green/20' : ''
              }`}
            >
              <Save className="w-5 h-5 mr-2" />
              {saved ? '已保存！' : '保存到历史'}
            </button>
            <Link to={`/detail/${result.type}`} className="btn-secondary flex items-center">
              <Info className="w-5 h-5 mr-2" />
              查看详细解读
            </Link>
            <button
              onClick={() => setShowShare(true)}
              className="btn-secondary flex items-center"
            >
              <Share2 className="w-5 h-5 mr-2" />
              分享结果
            </button>
            <button
              onClick={() => {
                resetTest();
                navigate('/test');
              }}
              className="btn-secondary flex items-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              重新测试
            </button>
          </div>
        </div>
      </div>

      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowShare(false)}
              className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="overflow-hidden rounded-3xl mb-4">
              <ShareCard ref={shareCardRef} result={result} />
            </div>

            <button
              onClick={handleDownload}
              className="btn-primary w-full flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              下载分享图片
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
