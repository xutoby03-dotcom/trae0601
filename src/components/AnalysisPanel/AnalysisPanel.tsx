import React from 'react';
import {
  FileText,
  Type,
  AlertCircle,
  Repeat,
  BookOpen,
  BarChart3,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  getArticleTypeName,
  getReadabilityLabel,
  getReadabilityColor
} from '../../utils/textAnalysis';

const AnalysisPanel: React.FC = () => {
  const { analysisResult, analysisPanelCollapsed, toggleAnalysisPanel } = useStore();

  if (analysisPanelCollapsed) {
    return (
      <button
        onClick={toggleAnalysisPanel}
        className="w-10 bg-gray-100 border-l border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
        title="展开分析面板"
      >
        <ChevronLeft size={18} className="text-gray-500" />
      </button>
    );
  }

  const statItems = [
    {
      icon: <Type size={16} />,
      label: '总字符数',
      value: analysisResult?.totalChars || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <FileText size={16} />,
      label: '总词数',
      value: analysisResult?.totalWords || 0,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: <BookOpen size={16} />,
      label: '段落数',
      value: analysisResult?.paragraphCount || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: <BarChart3 size={16} />,
      label: '句子数',
      value: analysisResult?.sentenceCount || 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 size={18} className="text-[#1e3a5f]" />
          文章分析
        </h3>
        <button
          onClick={toggleAnalysisPanel}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="收起面板"
        >
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} rounded-xl p-3 transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className={`${stat.color} mb-1`}>{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} className="text-emerald-600" />
            <span className="font-medium text-gray-800">可读性评分</span>
          </div>
          <div className="flex items-end gap-3 mb-2">
            <span className={`text-4xl font-bold ${getReadabilityColor(analysisResult?.readabilityScore || 0)}`}>
              {analysisResult?.readabilityScore || 0}
            </span>
            <span className={`text-sm mb-1 ${getReadabilityColor(analysisResult?.readabilityScore || 0)}`}>
              {getReadabilityLabel(analysisResult?.readabilityScore || 0)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                (analysisResult?.readabilityScore || 0) >= 80
                  ? 'bg-green-500'
                  : (analysisResult?.readabilityScore || 0) >= 60
                  ? 'bg-emerald-500'
                  : (analysisResult?.readabilityScore || 0) >= 40
                  ? 'bg-yellow-500'
                  : (analysisResult?.readabilityScore || 0) >= 20
                  ? 'bg-orange-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${analysisResult?.readabilityScore || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-[#f59e0b]" />
            <span className="font-medium text-gray-800">文章类型</span>
          </div>
          {analysisResult?.articleType && analysisResult.articleType !== 'other' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-800">
                  {getArticleTypeName(analysisResult.articleType)}
                </span>
                <span className="text-sm text-gray-500">
                  置信度 {analysisResult.typeConfidence}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-[#f59e0b] transition-all duration-500"
                  style={{ width: `${analysisResult.typeConfidence}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">内容较少，无法判断类型</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-red-500" />
            <span className="font-medium text-gray-800">错别字检测</span>
          </div>
          {analysisResult?.typos && analysisResult.typos.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {analysisResult.typos.slice(0, 5).map((typo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-red-50 rounded-lg text-sm"
                >
                  <span className="text-red-600 line-through">{typo.word}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-600 font-medium">{typo.suggestion}</span>
                </div>
              ))}
              {analysisResult.typos.length > 5 && (
                <p className="text-xs text-gray-400 text-center">
                  还有 {analysisResult.typos.length - 5} 个问题
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">未发现错别字 ✨</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Repeat size={16} className="text-purple-500" />
            <span className="font-medium text-gray-800">重复用词</span>
          </div>
          {analysisResult?.repeatedWords && analysisResult.repeatedWords.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {analysisResult.repeatedWords.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700">「{item.word}」</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-purple-400"
                        style={{ width: `${Math.min(item.count * 10, 100)}%` }}
                      />
                    </div>
                    <span className="text-gray-500 text-xs w-8 text-right">{item.count}次</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">暂未检测到重复用词</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
