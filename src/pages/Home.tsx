import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, Users, Target, Heart } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import TypeCard from '@/components/TypeCard';
import { allTypes } from '@/data/typeDetails';

export default function Home() {
  const dimensions = [
    { label: '能量来源', left: 'E 外向', right: 'I 内向', icon: Users },
    { label: '认知方式', left: 'S 感觉', right: 'N 直觉', icon: Target },
    { label: '决策方式', left: 'T 思考', right: 'F 情感', icon: Heart },
    { label: '生活态度', left: 'J 判断', right: 'P 感知', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />

      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center glass-card px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-neon-pink mr-2" />
              <span className="text-white/80 text-sm">探索真实的自己</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-display font-bold mb-6">
              <span className="gradient-text">MBTI</span>
              <span className="text-white"> 性格测试</span>
            </h1>
            
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
              60 道精选题目，深度解析你的性格密码。
              <br className="hidden sm:block" />
              发现你是 16 型人格中的哪一种！
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/test" className="btn-primary text-lg flex items-center">
                开始测试
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/history" className="btn-secondary text-lg">
                查看历史
              </Link>
            </div>
          </div>

          <div className="mb-24 animate-slide-up">
            <h2 className="text-3xl font-display font-bold text-center mb-12 text-white">
              什么是 <span className="gradient-text">MBTI</span>？
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dimensions.map((dim, index) => (
                <div
                  key={index}
                  className="glass-card p-6 neon-border hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <dim.icon className="w-10 h-10 text-neon-pink mb-4" />
                  <h3 className="text-lg font-bold text-white mb-3">{dim.label}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-neon-cyan font-semibold">{dim.left}</span>
                    <div className="flex-1 mx-3 h-1 bg-white/10 rounded-full">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-neon-pink to-neon-cyan" />
                    </div>
                    <span className="text-neon-purple font-semibold">{dim.right}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold text-center mb-4 text-white">
              16 型人格一览
            </h2>
            <p className="text-white/50 text-center mb-12">
              点击卡片查看详细解读
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {allTypes.map((type, index) => (
                <div
                  key={type}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TypeCard type={type} size="small" />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link to="/test" className="btn-primary text-lg inline-flex items-center">
              立即开始测试
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
