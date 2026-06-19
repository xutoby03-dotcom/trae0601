import { useState, useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Eye, MapPin, Package, Star, ChevronDown, ChevronUp, X, User, Phone, Calendar } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { usePostingStore } from '../../store/usePostingStore';
import { useApplicationStore } from '../../store/useApplicationStore';
import { usePosterStore } from '../../store/usePosterStore';
import { useBulletinBoardStore } from '../../store/useBulletinBoardStore';
import { formatDate, formatDateTime } from '../../utils/date';
import type { PostingStatus, PostingItem, Application, Poster, BulletinBoard } from '../../types';

interface PostingGroup {
  application: Application;
  poster: Poster | undefined;
  items: PostingItem[];
  totalQuantity: number;
  statusCounts: Record<PostingStatus, number>;
}

interface DetailModalProps {
  item: PostingItem;
  board: BulletinBoard | undefined;
  application: Application;
  poster: Poster | undefined;
  onClose: () => void;
}

function DetailModal({ item, board, application, poster, onClose }: DetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">张贴详情</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {poster && (
            <div className="flex gap-6 p-4 bg-gray-50 rounded-xl">
              <img
                src={poster.imageUrl}
                alt={poster.activityName}
                className="w-24 h-32 object-cover rounded-lg shadow"
              />
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-1">{poster.activityName}</h4>
                <p className="text-sm text-gray-500 mb-2">{poster.club}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    {poster.size}
                  </span>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    {poster.approvalNumber}
                  </span>
                  <StatusBadge status={item.status} type="posting" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <User className="w-4 h-4" /> 申请人
              </p>
              <p className="font-medium text-gray-900">{application.applicant}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Phone className="w-4 h-4" /> 联系方式
              </p>
              <p className="font-medium text-gray-900">{application.contact}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              张贴位置信息
            </h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">公告栏</span>
                <span className="font-medium text-gray-900">{board?.name || '未知'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">具体位置</span>
                <span className="font-medium text-gray-900">{board?.location || '未知'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">区域</span>
                <span className="font-medium text-gray-900">{board?.area || '未知'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 flex items-center gap-1">
                  <Package className="w-4 h-4" /> 张贴数量
                </span>
                <span className="font-medium text-gray-900">{item.quantity} 张</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 flex items-center gap-1">
                  <Star className="w-4 h-4" /> 是否置顶
                </span>
                <span className={`font-medium ${item.needTop ? 'text-amber-500' : 'text-gray-500'}`}>
                  {item.needTop ? '是' : '否'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              时间信息
            </h5>
            <div className="space-y-3">
              {item.postedAt && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">张贴时间</span>
                  <span className="font-medium text-gray-900">{formatDateTime(item.postedAt)}</span>
                </div>
              )}
              {item.removedAt && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">撤下时间</span>
                  <span className="font-medium text-gray-900">{formatDateTime(item.removedAt)}</span>
                </div>
              )}
              {poster && (
                <>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">活动开始</span>
                    <span className="font-medium text-gray-900">{formatDate(poster.startDate)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">活动结束</span>
                    <span className="font-medium text-gray-900">{formatDate(poster.endDate)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {item.photoUrl && (
            <div className="border-t border-gray-100 pt-6">
              <h5 className="font-bold text-gray-900 mb-4">张贴照片</h5>
              <img
                src={item.photoUrl}
                alt="张贴照片"
                className="w-full rounded-xl shadow"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PrintContent({ groups }: { groups: PostingGroup[] }) {
  const { getBulletinBoardById } = useBulletinBoardStore();

  return (
    <div className="p-8 print:p-0" style={{ fontFamily: 'sans-serif' }}>
      <div className="text-center mb-8 pb-4 border-b-2 border-gray-300">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">张贴清单</h1>
        <p className="text-gray-600">打印时间: {formatDateTime(new Date())}</p>
      </div>

      {groups.map((group, groupIndex) => (
        <div key={group.application.id} className={`mb-8 ${groupIndex > 0 ? 'page-break-before-always' : ''}`}>
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {group.poster?.activityName || '未知活动'}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>社团: {group.poster?.club || '未知'}</span>
              <span>申请人: {group.application.applicant}</span>
              <span>联系电话: {group.application.contact}</span>
              <span>批准文号: {group.poster?.approvalNumber || '未知'}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
              <span>活动时间: {group.poster ? `${formatDate(group.poster.startDate)} 至 ${formatDate(group.poster.endDate)}` : '未知'}</span>
              <span>总张贴数量: {group.totalQuantity} 张</span>
            </div>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left">序号</th>
                <th className="border border-gray-300 px-4 py-2 text-left">公告栏位置</th>
                <th className="border border-gray-300 px-4 py-2 text-left">具体位置</th>
                <th className="border border-gray-300 px-4 py-2 text-center">数量</th>
                <th className="border border-gray-300 px-4 py-2 text-center">置顶</th>
                <th className="border border-gray-300 px-4 py-2 text-left">状态</th>
                <th className="border border-gray-300 px-4 py-2 text-left">张贴时间</th>
                <th className="border border-gray-300 px-4 py-2 text-left">签收</th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item, index) => {
                const board = getBulletinBoardById(item.bulletinBoardId);
                return (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{board?.name || '未知'}</td>
                    <td className="border border-gray-300 px-4 py-2">{board?.location || '未知'}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.needTop ? '是' : '否'}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.status === 'pending' ? '待张贴' : item.status === 'posted' ? '已张贴' : item.status === 'expired' ? '已到期' : '已撤下'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{item.postedAt ? formatDate(item.postedAt) : '-'}</td>
                    <td className="border border-gray-300 px-4 py-2" style={{ minWidth: '100px' }}></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default function PostingList() {
  const [statusFilter, setStatusFilter] = useState<PostingStatus | 'all'>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<{
    item: PostingItem;
    board: BulletinBoard | undefined;
    application: Application;
    poster: Poster | undefined;
  } | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const { postingItems } = usePostingStore();
  const { applications, getApplicationById } = useApplicationStore();
  const { getPosterById } = usePosterStore();
  const { getBulletinBoardById } = useBulletinBoardStore();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @media print {
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .page-break-before-always {
          page-break-before: always;
        }
      }
    `,
  });

  const groups = useMemo<PostingGroup[]>(() => {
    const approvedApplications = applications.filter((app) => app.status === 'approved');

    return approvedApplications
      .map((application) => {
        const items = postingItems.filter(
          (item) => item.applicationId === application.id
        );

        const filteredItems =
          statusFilter === 'all'
            ? items
            : items.filter((item) => item.status === statusFilter);

        if (filteredItems.length === 0) return null;

        const poster = getPosterById(application.posterId);
        const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
        const statusCounts = filteredItems.reduce(
          (acc, item) => {
            acc[item.status]++;
            return acc;
          },
          { pending: 0, posted: 0, expired: 0, removed: 0 } as Record<PostingStatus, number>
        );

        return {
          application,
          poster,
          items: filteredItems,
          totalQuantity,
          statusCounts,
        };
      })
      .filter((group): group is PostingGroup => group !== null);
  }, [applications, postingItems, statusFilter, getPosterById]);

  const toggleGroup = (applicationId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(applicationId)) {
        next.delete(applicationId);
      } else {
        next.add(applicationId);
      }
      return next;
    });
  };

  const handleViewDetail = (item: PostingItem) => {
    const application = getApplicationById(item.applicationId);
    if (!application) return;

    const poster = getPosterById(application.posterId);
    const board = getBulletinBoardById(item.bulletinBoardId);

    setSelectedItem({ item, board, application, poster });
  };

  const statusOptions: { value: PostingStatus | 'all'; label: string }[] = [
    { value: 'all', label: '全部状态' },
    { value: 'pending', label: '待张贴' },
    { value: 'posted', label: '已张贴' },
    { value: 'expired', label: '已到期' },
    { value: 'removed', label: '已撤下' },
  ];

  return (
    <div>
      <PageHeader
        title="张贴清单"
        description="查看已审核通过申请的张贴清单，按申请分组管理"
        action={
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 font-medium"
          >
            <Printer className="w-4 h-4" />
            打印清单
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-card p-6 mb-6 animate-fade-in">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">状态筛选:</span>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    statusFilter === option.value
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            共 <span className="font-bold text-primary-500">{groups.length}</span> 份申请，
            <span className="font-bold text-primary-500">
              {groups.reduce((sum, g) => sum + g.items.length, 0)}
            </span>{' '}
            个张贴项
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card animate-fade-in">
          <div className="text-gray-400 text-lg">暂无张贴清单数据</div>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group, groupIndex) => {
            const isExpanded = expandedGroups.has(group.application.id);

            return (
              <div
                key={group.application.id}
                className="bg-white rounded-2xl shadow-card overflow-hidden animate-slide-up"
                style={{ animationDelay: `${groupIndex * 0.1}s` }}
              >
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleGroup(group.application.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {group.poster && (
                        <img
                          src={group.poster.imageUrl}
                          alt={group.poster.activityName}
                          className="w-16 h-20 object-cover rounded-lg shadow flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                          {group.poster?.activityName || '未知活动'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {group.poster?.club || '未知社团'} · 申请人: {group.application.applicant} · {group.poster?.approvalNumber || ''}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            <Package className="w-3 h-3" />
                            共 {group.totalQuantity} 张
                          </span>
                          {group.statusCounts.pending > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                              待张贴 {group.statusCounts.pending}
                            </span>
                          )}
                          {group.statusCounts.posted > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                              已张贴 {group.statusCounts.posted}
                            </span>
                          )}
                          {group.statusCounts.expired > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              已到期 {group.statusCounts.expired}
                            </span>
                          )}
                          {group.statusCounts.removed > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              已撤下 {group.statusCounts.removed}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm text-gray-400">
                        {group.items.length} 个张贴点
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              公告栏位置
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              具体位置
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              数量
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              置顶
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              状态
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {group.items.map((item, itemIndex) => {
                            const board = getBulletinBoardById(item.bulletinBoardId);
                            return (
                              <tr
                                key={item.id}
                                className="hover:bg-gray-50 transition-colors"
                                style={{ animationDelay: `${itemIndex * 0.05}s` }}
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-900">
                                      {board?.name || '未知'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-500">
                                    {board?.location || '未知'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-50 text-primary-600 rounded-full text-sm font-bold">
                                    {item.quantity}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {item.needTop ? (
                                    <Star className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto" />
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <StatusBadge status={item.status} type="posting" />
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetail(item);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                    详情
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <DetailModal
          item={selectedItem.item}
          board={selectedItem.board}
          application={selectedItem.application}
          poster={selectedItem.poster}
          onClose={() => setSelectedItem(null)}
        />
      )}

      <div className="hidden">
        <div ref={printRef}>
          <PrintContent groups={groups} />
        </div>
      </div>
    </div>
  );
}
