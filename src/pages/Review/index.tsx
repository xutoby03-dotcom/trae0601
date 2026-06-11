import { useState } from 'react';
import { useReimbursementStore } from '../../store/useReimbursementStore';
import { StatusTag } from '../../components/StatusTag';
import { Empty } from '../../components/Empty';
import { formatDate, formatCurrency, formatDateTime } from '../../utils/format';
import type { ReimbursementStatus } from '../../types';
import { mockRoommates } from '../../data/mockData';

const statusFilters: { label: string; value: ReimbursementStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待审核', value: 'pending' },
  { label: '审核中', value: 'reviewing' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
];

const Review = () => {
  const { items, updateStatus } = useReimbursementStore();
  const [filter, setFilter] = useState<ReimbursementStatus | 'all'>('all');
  const [reviewNote, setReviewNote] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const filteredItems = filter === 'all' ? items : items.filter((i) => i.status === filter);

  const handleApprove = (id: string) => {
    updateStatus(id, 'approved', mockRoommates[1].name, reviewNote || undefined);
    setReviewingId(null);
    setReviewNote('');
  };

  const handleReject = (id: string) => {
    updateStatus(id, 'rejected', mockRoommates[1].name, reviewNote || undefined);
    setReviewingId(null);
    setReviewNote('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">报销审核</h2>
        <p className="text-gray-500">查看和处理所有报销申请</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <Empty title="暂无记录" description={`当前没有${filter === 'all' ? '' : statusFilters.find((f) => f.value === filter)?.label}的报销记录`} />
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.description}</h3>
                    <StatusTag status={item.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    申请人：{item.applicant} · 日期：{formatDate(item.date)}
                  </p>
                  <p className="text-sm text-gray-500">
                    提交时间：{formatDateTime(item.createdAt)}
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(item.amount)}</p>
              </div>

              {item.reviewedBy && (
                <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                  <p className="text-sm text-gray-600">
                    审核人：{item.reviewedBy}
                    {item.reviewNote && ` · 备注：${item.reviewNote}`}
                  </p>
                </div>
              )}

              {(item.status === 'pending' || item.status === 'reviewing') && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {reviewingId === item.id ? (
                    <div className="space-y-3">
                      <textarea
                        className="input resize-none"
                        rows={2}
                        placeholder="审核备注（可选）"
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                      />
                      <div className="flex gap-3">
                        <button
                          className="btn btn-secondary flex-1"
                          onClick={() => {
                            setReviewingId(null);
                            setReviewNote('');
                          }}
                        >
                          取消
                        </button>
                        <button
                          className="btn btn-danger flex-1"
                          onClick={() => handleReject(item.id)}
                        >
                          拒绝
                        </button>
                        <button
                          className="btn btn-primary flex-1"
                          onClick={() => handleApprove(item.id)}
                        >
                          通过
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        className="btn btn-secondary flex-1"
                        onClick={() => updateStatus(item.id, 'reviewing', mockRoommates[1].name)}
                      >
                        标记审核中
                      </button>
                      <button
                        className="btn btn-primary flex-1"
                        onClick={() => setReviewingId(item.id)}
                      >
                        处理申请
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Review;
