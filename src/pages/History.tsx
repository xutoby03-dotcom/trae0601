import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, TrendingUp, Calendar, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import LineChart from '@/components/LineChart';
import MiniRadarChart from '@/components/MiniRadarChart';
import TypeCard from '@/components/TypeCard';
import { useTestStore } from '@/store/useTestStore';
import { typeDetails } from '@/data/typeDetails';
import type { TestResult } from '@/types';

export default function History() {
  const {
    history,
    loadHistoryFromStorage,
    clearHistoryData,
    deleteHistoryItem,
    setResult,
  } = useTestStore();
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    if (expandedId === id) {
      setExpandedId(null);
    }
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
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-3 text-neon-green" />
                    维度变化趋势
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-neon-pink mr-2" />
                      <span className="text-white/70">外向 E / 内向 I</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-neon-cyan mr-2" />
                      <span className="text-white/70">感觉 S / 直觉 N</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-neon-purple mr-2" />
                      <span className="text-white/70">思考 T / 情感 F</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-neon-green mr-2" />
                      <span className="text-white/70">判断 J / 感知 P</span>
                    </div>
                  </div>
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
                  const isExpanded = expandedId === result.id;

                  return (
                    <div
                      key={result.id}
                      className="glass-card overflow-hidden transition-all duration-300 animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div
                        className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => handleToggleExpand(result.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className="w-14 h-14 rounded-xl flex items-center justify-center font-display font-bold text-xl relative overflow-hidden"
                              style={{
                                background: `linear-gradient(135deg, ${detail.color}, ${detail.color}60)`,
                                boxShadow: `0 4px 15px ${detail.color}40`,
                              }}
                            >
                              <span className="text-white relative z-10">
                                {result.type}
                              </span>
                              <div
                                className="absolute inset-0 opacity-30"
                                style={{
                                  background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
                                }}
                              />
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

                          <div className="flex items-center space-x-3">
                            <div className="hidden sm:grid grid-cols-4 gap-4 text-center mr-2">
                              <div>
                                <div className="text-neon-pink font-bold text-sm">
                                  {result.percentages.EI}%
                                </div>
                                <div className="text-white/40 text-xs">E</div>
                              </div>
                              <div>
                                <div className="text-neon-cyan font-bold text-sm">
                                  {result.percentages.SN}%
                                </div>
                                <div className="text-white/40 text-xs">S</div>
                              </div>
                              <div>
                                <div className="text-neon-purple font-bold text-sm">
                                  {result.percentages.TF}%
                                </div>
                                <div className="text-white/40 text-xs">T</div>
                              </div>
                              <div>
                                <div className="text-neon-green font-bold text-sm">
                                  {result.percentages.JP}%
                                </div>
                                <div className="text-white/40 text-xs">J</div>
                              </div>
                            </div>

                            <button
                              onClick={(e) => handleDelete(e, result.id)}
                              className="p-2 rounded-full text-white/30 hover:text-neon-pink hover:bg-neon-pink/10 transition-all"
                              title="删除这条记录"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="text-white/40">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-white/10 pt-5 animate-slide-up">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h5 className="text-white font-semibold text-sm mb-3">
                                四维度百分比
                              </h5>

                              <div>
                                <div className="flex justify-between mb-1 text-sm">
                                  <span className="text-neon-pink/80">
                                    外向 E
                                  </span>
                                  <span className="text-white font-medium">
                                    {result.percentages.EI}%
                                  </span>
                                  <span className="text-white/60">
                                    内向 I
                                  </span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${result.percentages.EI}%`,
                                      background:
                                        'linear-gradient(90deg, #e94560, #e94560aa)',
                                    }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between mb-1 text-sm">
                                  <span className="text-neon-cyan/80">
                                    感觉 S
                                  </span>
                                  <span className="text-white font-medium">
                                    {result.percentages.SN}%
                                  </span>
                                  <span className="text-white/60">
                                    直觉 N
                                  </span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${result.percentages.SN}%`,
                                      background:
                                        'linear-gradient(90deg, #00d9ff, #00d9ffaa)',
                                    }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between mb-1 text-sm">
                                  <span className="text-neon-purple/80">
                                    思考 T
                                  </span>
                                  <span className="text-white font-medium">
                                    {result.percentages.TF}%
                                  </span>
                                  <span className="text-white/60">
                                    情感 F
                                  </span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${result.percentages.TF}%`,
                                      background:
                                        'linear-gradient(90deg, #a855f7, #a855f7aa)',
                                    }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between mb-1 text-sm">
                                  <span className="text-neon-green/80">
                                    判断 J
                                  </span>
                                  <span className="text-white font-medium">
                                    {result.percentages.JP}%
                                  </span>
                                  <span className="text-white/60">
                                    感知 P
                                  </span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${result.percentages.JP}%`,
                                      background:
                                        'linear-gradient(90deg, #00ff88, #00ff88aa)',
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center">
                              <h5 className="text-white font-semibold text-sm mb-3 self-start">
                                雷达图概览
                              </h5>
                              <div className="w-full max-w-[200px] h-[200px]">
                                <MiniRadarChart
                                  result={result}
                                  color={detail.color}
                                />
                              </div>
                              <button
                                onClick={() => handleViewResult(result)}
                                className="btn-secondary text-sm mt-3 w-full"
                              >
                                查看完整结果
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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
