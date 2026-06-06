import { useParams, Link } from 'react-router-dom';
import { Sparkles, Briefcase, Star, Heart, Users, ChevronRight } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import TypeCard from '@/components/TypeCard';
import { typeDetails } from '@/data/typeDetails';
import type { MBIType } from '@/types';

export default function Detail() {
  const { type } = useParams<{ type: string }>();
  const detail = type ? typeDetails[type as MBIType] : null;

  if (!detail) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <ParticleBackground />
        <div className="relative z-10 text-center">
          <p className="text-white/60 text-xl mb-6">未找到该类型</p>
          <Link to="/" className="btn-primary">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />

      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div
              className="text-6xl sm:text-8xl font-display font-bold mb-4"
              style={{ color: detail.color, textShadow: `0 0 40px ${detail.color}40` }}
            >
              {detail.type}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {detail.name}
            </h1>
            <p className="text-xl text-white/60 mb-6">「{detail.nickname}」</p>
            <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed">
              {detail.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="glass-card p-8 animate-slide-up">
              <div className="flex items-center mb-6">
                <Sparkles className="w-6 h-6 text-neon-pink mr-3" />
                <h3 className="text-xl font-bold text-white">性格特点</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {detail.traits.map((trait, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full text-sm font-medium glass-card"
                    style={{ color: detail.color, borderColor: `${detail.color}30` }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center mb-6">
                <Briefcase className="w-6 h-6 text-neon-cyan mr-3" />
                <h3 className="text-xl font-bold text-white">适合职业</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {detail.careers.map((career, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-3"
                      style={{ backgroundColor: detail.color }}
                    />
                    <span className="text-white/80">{career}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-8 mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center mb-6">
              <Star className="w-6 h-6 text-neon-purple mr-3" />
              <h3 className="text-xl font-bold text-white">名人代表</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {detail.celebrities.map((celeb, index) => (
                <div
                  key={index}
                  className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${detail.color}, ${detail.color}50)`,
                    }}
                  >
                    {celeb.name.charAt(0)}
                  </div>
                  <h4 className="text-white font-semibold">{celeb.name}</h4>
                  <p className="text-white/50 text-sm">{celeb.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 mb-12 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center mb-8">
              <Heart className="w-6 h-6 text-neon-pink mr-3" />
              <h3 className="text-xl font-bold text-white">性格配对</h3>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center mb-4">
                  <span className="px-3 py-1 rounded-full bg-neon-green/20 text-neon-green text-sm font-semibold">
                    💚 最佳匹配
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {detail.compatibility.best.map((t) => (
                    <Link key={t} to={`/detail/${t}`}>
                      <TypeCard type={t} size="small" />
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <span className="px-3 py-1 rounded-full bg-neon-cyan/20 text-neon-cyan text-sm font-semibold">
                    💙 良好匹配
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {detail.compatibility.good.map((t) => (
                    <Link key={t} to={`/detail/${t}`}>
                      <TypeCard type={t} size="small" />
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <span className="px-3 py-1 rounded-full bg-neon-pink/20 text-neon-pink text-sm font-semibold">
                    💛 需要磨合
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {detail.compatibility.challenge.map((t) => (
                    <Link key={t} to={`/detail/${t}`}>
                      <TypeCard type={t} size="small" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/test" className="btn-primary inline-flex items-center">
              开始测试，看看你是哪一种
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
