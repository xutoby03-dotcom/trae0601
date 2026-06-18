import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Ban, CheckSquare, Square } from 'lucide-react';
import { useFurnitureStore } from '../store/furnitureStore';
import { useInspectionStore } from '../store/inspectionStore';
import { useRepairStore } from '../store/repairStore';
import { useMaintenanceStore } from '../store/maintenanceStore';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { FURNITURE_TYPE_LABELS, ISSUE_TYPE_LABELS } from '../types';
import type { InspectionResult, IssueType } from '../types';

interface InspectionItem {
  furnitureId: string;
  result: InspectionResult;
  remark: string;
  issueType?: IssueType;
  inspected: boolean;
}

export function RoomInspection() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const furnitureList = useFurnitureStore((state) => state.furnitureList);
  const addBatchRecords = useInspectionStore((state) => state.addBatchRecords);
  const addRepairOrder = useRepairStore((state) => state.addRepairOrder);
  const getRepairOrders = useRepairStore((state) => state.repairOrders);
  const addMaintenance = useMaintenanceStore((state) => state.addRecord);
  const updateFurnitureStatus = useFurnitureStore((state) => state.updateStatus);

  const roomFurniture = useMemo(
    () => furnitureList.filter((f) => f.room === roomId),
    [furnitureList, roomId]
  );

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>(() =>
    roomFurniture.map((f) => ({
      furnitureId: f.id,
      result: 'normal' as InspectionResult,
      remark: '',
      inspected: false,
    }))
  );

  const [showIssueModal, setShowIssueModal] = useState<string | null>(null);
  const currentItem = showIssueModal
    ? inspectionItems.find((i) => i.furnitureId === showIssueModal)
    : null;
  const [issueForm, setIssueForm] = useState({
    result: 'issue' as InspectionResult,
    issueType: 'wobble' as IssueType,
    remark: '',
  });

  const progress = useMemo(() => {
    const inspected = inspectionItems.filter((i) => i.inspected).length;
    return {
      inspected,
      total: inspectionItems.length,
      percent: inspectionItems.length > 0 ? (inspected / inspectionItems.length) * 100 : 0,
      allInspected: inspected === inspectionItems.length,
    };
  }, [inspectionItems]);

  const handleSetResult = (furnitureId: string, result: InspectionResult) => {
    if (result === 'normal') {
      setInspectionItems((prev) =>
        prev.map((item) =>
          item.furnitureId === furnitureId
            ? { ...item, result, remark: '', issueType: undefined, inspected: true }
            : item
        )
      );
    } else {
      setShowIssueModal(furnitureId);
      setIssueForm({ result, issueType: 'wobble', remark: '' });
    }
  };

  const handleConfirmIssue = () => {
    if (showIssueModal) {
      setInspectionItems((prev) =>
        prev.map((item) =>
          item.furnitureId === showIssueModal
            ? { ...item, result: issueForm.result, remark: issueForm.remark, issueType: issueForm.issueType, inspected: true }
            : item
        )
      );
      setShowIssueModal(null);
    }
  };

  const handleFinish = () => {
    const today = new Date().toISOString().slice(0, 10);
    const records = inspectionItems.map((item) => ({
      room: roomId || '',
      inspector: '李巡检',
      inspectDate: today,
      furnitureId: item.furnitureId,
      result: item.result,
      remark: item.remark,
    }));
    addBatchRecords(records);

    // 更新桌椅状态并创建报修单 + 维修记录
    const problemItems = inspectionItems.filter(
      (item) => item.result === 'out_of_service' || item.result === 'issue'
    );

    problemItems.forEach((item) => {
      if (item.result === 'out_of_service') {
        updateFurnitureStatus(item.furnitureId, 'out_of_service');
      } else {
        updateFurnitureStatus(item.furnitureId, 'pending_repair');
      }

      const severity = item.result === 'out_of_service' ? 'high' : 'medium';
      const description = item.remark || (item.result === 'out_of_service' ? '巡检发现问题，已停用' : '巡检发现问题');

      const repairOrderId = addRepairOrder({
        furnitureId: item.furnitureId,
        reporter: '巡检员',
        issueType: item.issueType || 'wobble',
        description,
        severity,
        photos: [],
      });

      addMaintenance({
        repairOrderId,
        furnitureId: item.furnitureId,
        handler: '',
        parts: '',
        cost: 0,
        reviewPhotos: [],
        finishDate: '',
      });
    });

    // 更新最近巡检日期
    roomFurniture.forEach((f) => {
      useFurnitureStore.getState().updateFurniture(f.id, { lastInspection: today });
    });

    navigate('/inspection');
  };

  const currentFurniture = showIssueModal
    ? roomFurniture.find((f) => f.id === showIssueModal)
    : null;

  return (
    <div className="space-y-6">
      {/* 顶部 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/inspection')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        <div className="text-right">
          <h1 className="text-xl font-bold text-gray-800">{roomId} - 巡检</h1>
          <p className="text-sm text-gray-500">
            已检 {progress.inspected}/{progress.total} 件
          </p>
        </div>
      </div>

      {/* 进度条 */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">巡检进度</span>
          <span className="text-sm font-medium text-primary-600">
            {progress.percent.toFixed(0)}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${progress.percent}%` }}
          ></div>
        </div>
      </div>

      {/* 操作提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          💡 巡检提示：请逐件检查桌椅状态，发现问题请选择对应的问题类型，严重问题请标记为「停用」
        </p>
      </div>

      {/* 桌椅列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roomFurniture.map((furniture) => {
          const inspection = inspectionItems.find((i) => i.furnitureId === furniture.id);
          const isInspected = inspection?.inspected;

          return (
            <div
              key={furniture.id}
              className={`card p-4 transition-all ${
                isInspected ? 'ring-2 ring-secondary-500/50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{furniture.id}</h3>
                  <p className="text-xs text-gray-500">
                    {FURNITURE_TYPE_LABELS[furniture.type]}
                  </p>
                </div>
                <StatusBadge type="furniture" status={furniture.status} />
              </div>

              {isInspected && inspection && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">
                    巡检结果：
                    <span
                      className={
                        inspection.result === 'normal'
                          ? 'text-green-600'
                          : inspection.result === 'issue'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }
                    >
                      {inspection.result === 'normal'
                        ? '正常'
                        : inspection.result === 'issue'
                        ? '有问题'
                        : '已停用'}
                    </span>
                  </p>
                  {inspection.remark && (
                    <p className="text-xs text-gray-600 mt-1">{inspection.remark}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleSetResult(furniture.id, 'normal')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                    inspection?.result === 'normal'
                      ? 'bg-green-500 text-white'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {inspection?.result === 'normal' ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  正常
                </button>
                <button
                  onClick={() => handleSetResult(furniture.id, 'issue')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                    inspection?.result === 'issue'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  有问题
                </button>
                <button
                  onClick={() => handleSetResult(furniture.id, 'out_of_service')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                    inspection?.result === 'out_of_service'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                  停用
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部操作 */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-gray-50/80 backdrop-blur p-4 -mx-6 -mb-6 rounded-t-xl">
        <button onClick={() => navigate('/inspection')} className="btn btn-outline">
          取消
        </button>
        <button
          onClick={handleFinish}
          disabled={!progress.allInspected}
          className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4" />
          {progress.allInspected ? '完成巡检' : `还剩 ${progress.total - progress.inspected} 件未巡检`}
        </button>
      </div>

      {/* 问题详情弹窗 */}
      <Modal
        isOpen={!!showIssueModal}
        onClose={() => setShowIssueModal(null)}
        title={`登记问题 - ${currentFurniture?.id}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">问题类型</label>
            <select
              value={issueForm.issueType}
              onChange={(e) =>
                setIssueForm({ ...issueForm, issueType: e.target.value as IssueType })
              }
              className="select"
            >
              {Object.entries(ISSUE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">问题等级</label>
            <div className="flex gap-3">
              <label
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 cursor-pointer transition-all ${
                  issueForm.result === 'issue'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
              <input
                type="radio"
                name="result"
                value="issue"
                checked={issueForm.result === 'issue'}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, result: e.target.value as InspectionResult })
                }
                className="sr-only"
              />
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">一般问题</span>
            </label>
            <label
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 cursor-pointer transition-all ${
                issueForm.result === 'out_of_service'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <input
                type="radio"
                name="result"
                value="out_of_service"
                checked={issueForm.result === 'out_of_service'}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, result: e.target.value as InspectionResult })
                }
                className="sr-only"
              />
              <Ban className="w-4 h-4" />
              <span className="font-medium">严重停用</span>
            </label>
            </div>
          </div>
          <div>
            <label className="label">问题描述</label>
            <textarea
              value={issueForm.remark}
              onChange={(e) => setIssueForm({ ...issueForm, remark: e.target.value })}
              placeholder="请描述具体问题..."
              rows={3}
              className="input resize-none"
            />
          </div>
          {issueForm.result === 'out_of_service' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                ⚠️ 标记为停用后，该桌椅将自动标记为停用状态并生成报修单
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowIssueModal(null)}
              className="btn btn-outline"
            >
              取消
            </button>
            <button onClick={handleConfirmIssue} className="btn btn-primary">
              确认
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
