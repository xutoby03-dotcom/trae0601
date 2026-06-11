import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Clock, Users, DollarSign, Target,
  Star, MessageSquare, QrCode, CheckCircle,
  Filter, X, Copy, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { StarRating } from '@/components/ui/StarRating';
import { FeedbackList } from '@/components/FeedbackList';
import { KeywordCloud } from '@/components/KeywordCloud';
import { useTastingStore } from '@/store/useTastingStore';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import {
  calculateAverageRating,
  calculateDimensionAverages,
  calculatePurchaseRates,
  formatDate,
  daysLeft
} from '@/utils/statistics';
import { filterFeedbacksByKeyword } from '@/utils/keywords';
import { cn } from '@/lib/utils';

export default function TastingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const items = useTastingStore(state => state.items);
  const feedbacks = useTastingStore(state => state.feedbacks);
  const markAsReady = useTastingStore(state => state.markAsReady);

  const item = useMemo(
    () => items.find(i => i.id === id),
    [items, id]
  );
  const allFeedbacks = useMemo(
    () => feedbacks.filter(f => f.tastingItemId === id),
    [feedbacks, id]
  );

  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const feedbackUrl = useMemo(() => {
    if (typeof window !== 'undefined' && id) {
      return `${window.location.origin}/feedback/${id}`;
    }
    return '';
  }, [id]);

  const handleCopyLink = async () => {
    if (feedbackUrl) {
      try {
        await navigator.clipboard.writeText(feedbackUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-warm-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-brown-500 text-lg">试吃品不存在</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  const avgRating = calculateAverageRating(allFeedbacks);
  const dimensionAvgs = calculateDimensionAverages(allFeedbacks);
  const purchaseRates = calculatePurchaseRates(allFeedbacks);
  const filteredFeedbacks = filterFeedbacksByKeyword(allFeedbacks, selectedKeyword);

  const handleKeywordClick = (keyword: string) => {
    setSelectedKeyword(selectedKeyword === keyword ? '' : keyword);
  };

  const dimensions = [
    { key: 'sweetness', label: '甜度', color: 'bg-pink-400' },
    { key: 'saltiness', label: '咸度', color: 'bg-yellow-400' },
    { key: 'spiciness', label: '辣度', color: 'bg-red-400' },
    { key: 'portion', label: '分量', color: 'bg-blue-400' },
    { key: 'packaging', label: '包装', color: 'bg-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-brown-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>返回</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="relative h-64 md:h-80">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Tag className={cn(STATUS_COLORS[item.status], 'bg-opacity-90')}>
                      {STATUS_LABELS[item.status]}
                    </Tag>
                    <Tag variant="info" className="bg-white/20 text-white border-none">
                      {item.flavor}口味
                    </Tag>
                  </div>
                  <h1 className="text-3xl font-bold mb-1">{item.name}</h1>
                  <div className="flex items-center gap-4 text-sm opacity-90">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{avgRating > 0 ? avgRating.toFixed(1) : '暂无评分'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{allFeedbacks.length} 条反馈</span>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-brown-50 rounded-xl">
                    <DollarSign className="w-5 h-5 mx-auto text-primary-500 mb-1" />
                    <p className="text-xs text-brown-500">成本</p>
                    <p className="font-bold text-brown-800">¥{item.cost}</p>
                  </div>
                  <div className="text-center p-3 bg-brown-50 rounded-xl">
                    <Users className="w-5 h-5 mx-auto text-mint-500 mb-1" />
                    <p className="text-xs text-brown-500">份数</p>
                    <p className="font-bold text-brown-800">{item.totalPortions}份</p>
                  </div>
                  <div className="text-center p-3 bg-brown-50 rounded-xl">
                    <Target className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                    <p className="text-xs text-brown-500">目标客群</p>
                    <p className="font-bold text-brown-800 text-sm">{item.targetAudience}</p>
                  </div>
                  <div className="text-center p-3 bg-brown-50 rounded-xl">
                    <Clock className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                    <p className="text-xs text-brown-500">剩余</p>
                    <p className="font-bold text-brown-800">
                      {daysLeft(item.deadline) > 0 ? `${daysLeft(item.deadline)}天` : '已截止'}
                    </p>
                  </div>
                </div>

                {item.description && (
                  <p className="text-brown-600 leading-relaxed">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Link to={`/feedback/${item.id}`}>
                    <Button>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      提交反馈
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => setShowQR(true)}>
                    <QrCode className="w-4 h-4 mr-2" />
                    展示二维码
                  </Button>
                  {item.status !== 'ready' && allFeedbacks.length >= 10 && (
                    <Button
                      variant="secondary"
                      onClick={() => markAsReady(item.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      标记准备上架
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-brown-800 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    口味分析
                  </h2>
                </div>

                <div className="space-y-3">
                  {dimensions.map(dim => (
                    <div key={dim.key} className="flex items-center gap-3">
                      <span className="w-12 text-sm text-brown-600">{dim.label}</span>
                      <div className="flex-1 h-6 bg-brown-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', dim.color)}
                          style={{ width: `${(dimensionAvgs[dim.key as keyof typeof dimensionAvgs] / 5) * 100}%` }}
                        />
                      </div>
                      <span className="w-10 text-sm font-medium text-brown-800 text-right">
                        {dimensionAvgs[dim.key as keyof typeof dimensionAvgs].toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-brown-800 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary-500" />
                    反馈列表
                    {selectedKeyword && (
                      <Tag size="sm" variant="primary" className="ml-2">
                        <Filter className="w-3 h-3 mr-1" />
                        {selectedKeyword}
                        <button
                          onClick={() => setSelectedKeyword('')}
                          className="ml-1 hover:text-white/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Tag>
                    )}
                  </h2>
                  <span className="text-sm text-brown-400">
                    共 {filteredFeedbacks.length} 条
                  </span>
                </div>

                <FeedbackList feedbacks={filteredFeedbacks} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4">
                <h3 className="font-semibold text-brown-800">购买意愿</h3>
                <div className="flex items-center justify-center gap-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#F5F0ED"
                        strokeWidth="12"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="12"
                        strokeDasharray={`${purchaseRates.yes * 2.51} 251`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">{purchaseRates.yes}%</span>
                      <span className="text-xs text-brown-500">愿意购买</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="font-bold text-green-600">{purchaseRates.yes}%</p>
                    <p className="text-xs text-brown-500">愿意</p>
                  </div>
                  <div>
                    <p className="font-bold text-amber-500">{purchaseRates.maybe}%</p>
                    <p className="text-xs text-brown-500">犹豫</p>
                  </div>
                  <div>
                    <p className="font-bold text-red-500">{purchaseRates.no}%</p>
                    <p className="text-xs text-brown-500">不愿</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4">
                <h3 className="font-semibold text-brown-800">热门关键词</h3>
                <KeywordCloud
                  feedbacks={allFeedbacks}
                  onKeywordClick={handleKeywordClick}
                  selectedKeyword={selectedKeyword}
                  limit={12}
                />
                <p className="text-xs text-brown-400 text-center">
                  点击关键词可筛选反馈
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3">
                <h3 className="font-semibold text-brown-800">试吃进度</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-brown-500">已收集反馈</span>
                    <span className="font-medium text-brown-800">
                      {allFeedbacks.length} / {item.totalPortions}
                    </span>
                  </div>
                  <div className="h-2 bg-brown-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (allFeedbacks.length / item.totalPortions) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-brown-400">
                    {formatDate(item.deadline)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {showQR && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQR(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <Card className="max-w-sm w-full animate-fade-in">
              <CardContent className="text-center space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-brown-800">扫码提交反馈</h3>
                  <button
                    onClick={() => setShowQR(false)}
                    className="p-1.5 rounded-full hover:bg-brown-100 text-brown-400 hover:text-brown-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-brown-500">{item.name} - {item.flavor}口味</p>
                <div className="bg-white p-5 rounded-xl border border-brown-200 inline-block">
                  <QRCodeSVG
                    value={feedbackUrl}
                    size={200}
                    level="M"
                    includeMargin={false}
                    fgColor="#5D4037"
                    bgColor="#FFFFFF"
                  />
                </div>
                <div className="bg-brown-50 rounded-xl p-3">
                  <p className="text-xs text-brown-500 mb-2">反馈链接</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-brown-700 bg-white px-3 py-2 rounded-lg border border-brown-200 truncate text-left">
                      {feedbackUrl}
                    </code>
                    <button
                      onClick={handleCopyLink}
                      className={cn(
                        'flex-shrink-0 p-2.5 rounded-lg transition-all duration-200',
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
                      )}
                      title="复制链接"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-600 mt-2 font-medium">已复制到剪贴板！</p>
                  )}
                </div>
                <p className="text-xs text-brown-400">
                  顾客扫描二维码或点击链接即可提交反馈
                </p>
                <div className="pt-1 grid grid-cols-2 gap-3">
                  <Button variant="secondary" onClick={handleCopyLink} fullWidth>
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        复制链接
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowQR(false)} fullWidth>
                    关闭
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
