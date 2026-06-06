import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import LineChart from '@/components/LineChart';
import TypeCard from '@/components/TypeCard';
import { useTestStore } from '@/store/useTestStore';
import { typeDetails } from '@/data/typeDetails';
import type { TestResult } from '@/types';

export default function History() {
  const { history, loadHistoryFromStorage, clearHistoryData, setResult } = useTestStore();
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  useEffect(() => {
    loadHistoryFromStorage();
  }, [loadHistoryFromStorage]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewResult = (result: TestResult) => {
    setResult(result);
    setSelectedResult(result);
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />

      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center glass-card px-4 py-2 rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-neon-green mr-2" />
              <span className="text-white/80 text-sm">追踪你的性格变化</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-4">
              测试历史
            </h1>
            <p className="text-white/60">
              共 {history.length} 次测试记录
            </p>
          </div>

          {history.length === 0 ? (
            <div className="glass-card p-12 text-center animate-fade-in">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-white mb-2">
                还没有测试记录
              </h3>
              <p className="text-white/60 mb-6">
                完成测试后结果会自动保存到这里
                <br />
                可以多次测试，观察性格变化趋势
              </p>
              <Link to="/test" className="btn-primary inline-flex items-center">
                开始第一次测试
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          ) : (
            <>
              {history.length >= 2 && (
                <div className="glass-card p-8 mb-8 animate-slide-up">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-3 text-neon-green" />
                    维度变化趋势
                  </h3>
                  <div className="h-80">
                    <LineChart history={history} />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    历史记录
                  </h3>
                  <button
                    onClick={clearHistoryData}
                    className="flex items-center text-white/50 hover:text-neon-pink transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    清空记录
                  </button>
                </div>

                {history.map((result, index) => {
                  const detail = typeDetails[result.type];
                  return (
                    <div
                      key={result.id}
                      className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleViewResult(result)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-2xl"
                            style={{
                              backgroundColor: `${detail.color}20`,
                              color: detail.color,
                              boxShadow: `0 0 20px ${detail.color}20`,
                            }}
                          >
                            {result.type}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">
                              {detail.name}
                            </h4>
                            <p className="text-white/50 text-sm">
                              {detail.nickname}
                            </p>
                            <div className="flex items-center mt-1 text-white/40 text-sm">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(result.timestamp)}
                            </div>
                          </div>
                        </div>

                        <div className="hidden sm:grid grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-neon-pink font-bold">
                              {result.percentages.EI}%
                            </div>
                            <div className="text-white/40 text-xs">E</div>
                          </div>
                          <div>
                            <div className="text-neon-cyan font-bold">
                              {result.percentages.SN}%
                            </div>
                            <div className="text-white/40 text-xs">S</div>
                          </div>
                          <div>
                            <div className="text-neon-purple font-bold">
                              {result.percentages.TF}%
                            </div>
                            <div className="text-white/40 text-xs">T</div>
                          </div>
                          <div>
                            <div className="text-neon-green font-bold">
                              {result.percentages.JP}%
                            </div>
                            <div className="text-white/40 text-xs">J</div>
                          </div>
                        </div>

                        <Link
                          to={`/detail/${result.type}`}
                          className="text-white/40 hover:text-white transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedResult(null)}
        >
          <div
            className="max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <TypeCard type={selectedResult.type} size="large" />
            <div className="mt-4 text-center">
              <Link
                to="/result"
                className="btn-primary inline-flex items-center"
              >
                查看详细结果
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
