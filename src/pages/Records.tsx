import { useState, useMemo } from 'react';
import useAppStore from '../store/useAppStore';
import StarRating from '../components/common/StarRating';
import { formatDateTime } from '../utils/date';
import { cn } from '../lib/utils';
import { Plus, Filter, Trash2, X, Check } from 'lucide-react';
import type { CleanRecord, ClumpLevel } from '../types';

const clumpColorMap: Record<ClumpLevel, { bg: string; text: string; border: string }> = {
  少: { bg: '#A8C5A025', text: '#6B8E7A', border: '#A8C5A050' },
  中: { bg: '#E8C77A25', text: '#B8904A', border: '#E8C77A50' },
  多: { bg: '#D4896A25', text: '#A8644A', border: '#D4896A50' },
};

type DateRangeFilter = '7' | '30' | 'all';

const Records = () => {
  const {
    members,
    litterBoxes,
    records,
    currentMemberId,
    addRecord,
    removeRecord,
  } = useAppStore();

  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [filterBox, setFilterBox] = useState<string>('all');
  const [filterMember, setFilterMember] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<DateRangeFilter>('all');
  const [filterFullChange, setFilterFullChange] = useState(false);

  const [formBox, setFormBox] = useState<string>('');
  const [formMember, setFormMember] = useState<string>(currentMemberId);
  const [formCleanTime, setFormCleanTime] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [formSmellLevel, setFormSmellLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [formClumpLevel, setFormClumpLevel] = useState<ClumpLevel>('中');
  const [formAddedLitter, setFormAddedLitter] = useState(false);
  const [formAddedAmount, setFormAddedAmount] = useState<number>(200);
  const [formIsFullChange, setFormIsFullChange] = useState(false);
  const [formNote, setFormNote] = useState<string>('');

  const filteredRecords = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    return records
      .filter((r) => {
        if (filterBox !== 'all' && r.litterBoxId !== filterBox) return false;
        if (filterMember !== 'all' && r.memberId !== filterMember) return false;
        if (filterFullChange && !r.isFullChange) return false;
        if (filterDateRange !== 'all') {
          const recordTime = new Date(r.cleanTime).getTime();
          const diff = now - recordTime;
          if (filterDateRange === '7' && diff > sevenDaysMs) return false;
          if (filterDateRange === '30' && diff > thirtyDaysMs) return false;
        }
        return true;
      })
      .sort(
        (a, b) => new Date(b.cleanTime).getTime() - new Date(a.cleanTime).getTime()
      );
  }, [records, filterBox, filterMember, filterDateRange, filterFullChange]);

  const getBoxName = (id: string) => litterBoxes.find((b) => b.id === id)?.name || '未知';
  const getMember = (id: string) => members.find((m) => m.id === id);

  const handleFullChangeToggle = (checked: boolean) => {
    setFormIsFullChange(checked);
    if (checked) {
      setFormAddedLitter(true);
    }
  };

  const resetForm = () => {
    setFormBox('');
    setFormMember(currentMemberId);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setFormCleanTime(now.toISOString().slice(0, 16));
    setFormSmellLevel(3);
    setFormClumpLevel('中');
    setFormAddedLitter(false);
    setFormAddedAmount(200);
    setFormIsFullChange(false);
    setFormNote('');
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!formBox) return;
    const cleanTimeISO = new Date(formCleanTime).toISOString();
    const record: Omit<CleanRecord, 'id'> = {
      litterBoxId: formBox,
      memberId: formMember,
      cleanTime: cleanTimeISO,
      smellLevel: formSmellLevel,
      clumpLevel: formClumpLevel,
      addedLitter: formIsFullChange ? true : formAddedLitter,
      addedAmount: formIsFullChange ? 0 : formAddedLitter ? formAddedAmount : 0,
      isFullChange: formIsFullChange,
      note: formNote.trim() || undefined,
    };
    addRecord(record);
    closeModal();
  };

  const handleDelete = (id: string) => {
    removeRecord(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-[#5C4A3A]"
            style={{ fontFamily: "'LXGW WenKai', system-ui, serif" }}
          >
            清洁记录
          </h1>
          <p className="text-sm text-[#8B7A6A] mt-1">
            共 {filteredRecords.length} 条记录
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4896A] text-white font-medium hover:bg-[#C4785A] active:scale-95 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          添加记录
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#F0E6D8] p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-[#8B7A6A]">
          <Filter size={16} />
          <span className="text-sm font-medium">筛选条件</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#6B5A4A] whitespace-nowrap">猫砂盆：</label>
            <select
              value={filterBox}
              onChange={(e) => setFilterBox(e.target.value)}
              className="px-4 py-2 rounded-xl border border-[#E8D8C4] bg-[#FAF5EC] text-[#5C4A3A] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4896A]/30 focus:border-[#D4896A] min-w-[140px]"
            >
              <option value="all">全部</option>
              {litterBoxes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-[#6B5A4A] whitespace-nowrap">负责人：</label>
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="px-4 py-2 rounded-xl border border-[#E8D8C4] bg-[#FAF5EC] text-[#5C4A3A] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4896A]/30 focus:border-[#D4896A] min-w-[120px]"
            >
              <option value="all">全部</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.avatar} {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-[#6B5A4A] whitespace-nowrap">日期：</label>
            <div className="flex rounded-xl border border-[#E8D8C4] overflow-hidden bg-[#FAF5EC]">
              {(['7', '30', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setFilterDateRange(range)}
                  className={cn(
                    'px-4 py-2 text-sm transition-all',
                    filterDateRange === range
                      ? 'bg-[#D4896A] text-white'
                      : 'text-[#6B5A4A] hover:bg-[#F5EBDC]'
                  )}
                >
                  {range === '7' ? '近7天' : range === '30' ? '近30天' : '全部'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterFullChange}
                onChange={(e) => setFilterFullChange(e.target.checked)}
                className="w-4 h-4 rounded-md border-[#E8D8C4] text-[#D4896A] focus:ring-[#D4896A]/30"
              />
              <span className="text-sm text-[#6B5A4A]">只看整盆换砂</span>
            </label>
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#F0E6D8] py-20 flex flex-col items-center justify-center shadow-sm">
          <div className="text-7xl mb-4">🐱</div>
          <p className="text-lg text-[#8B7A6A] font-medium">
            暂无记录，快去铲第一盆砂吧！
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F0E6D8] overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#FAF5EC] border-b border-[#F0E6D8] text-xs font-medium text-[#8B7A6A] uppercase tracking-wider">
            <div className="col-span-2">时间</div>
            <div className="col-span-2">猫砂盆</div>
            <div className="col-span-2">负责人</div>
            <div className="col-span-2">异味等级</div>
            <div className="col-span-1">结团</div>
            <div className="col-span-2">其他</div>
            <div className="col-span-1 text-right">操作</div>
          </div>

          {filteredRecords.map((record, index) => {
            const member = getMember(record.memberId);
            const cc = clumpColorMap[record.clumpLevel];
            return (
              <div
                key={record.id}
                className={cn(
                  'grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#F5EBDC] last:border-b-0 items-center transition-colors hover:bg-[#FAF8F3]',
                  index % 2 === 1 ? 'bg-[#FBF9F5]' : 'bg-white'
                )}
              >
                <div className="col-span-2">
                  <div className="text-sm text-[#5C4A3A] font-medium">
                    {formatDateTime(record.cleanTime)}
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium bg-[#F5EBDC] text-[#6B5A4A]">
                    {getBoxName(record.litterBoxId)}
                  </span>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                      style={{ backgroundColor: `${member?.color}20` }}
                    >
                      {member?.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#5C4A3A]">
                        {member?.name}
                      </div>
                      <div
                        className="w-3 h-1.5 rounded-full mt-0.5"
                        style={{ backgroundColor: member?.color }}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <StarRating value={record.smellLevel} size="sm" showLabel />
                </div>

                <div className="col-span-1">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border"
                    style={{
                      backgroundColor: cc.bg,
                      color: cc.text,
                      borderColor: cc.border,
                    }}
                  >
                    {record.clumpLevel}
                  </span>
                </div>

                <div className="col-span-2 flex flex-wrap items-center gap-1.5">
                  {record.isFullChange && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#8BA4B8]/20 text-[#5A7A96] border border-[#8BA4B8]/30">
                      🔄 整盆换砂
                    </span>
                  )}
                  {record.addedLitter && !record.isFullChange && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#A8C5A0]/20 text-[#5A7A5A] border border-[#A8C5A0]/30">
                      ➕ 补砂 {record.addedAmount}g
                    </span>
                  )}
                  {record.note && (
                    <span className="text-xs text-[#8B7A6A] truncate max-w-full">
                      💬 {record.note}
                    </span>
                  )}
                </div>

                <div className="col-span-1 text-right relative">
                  {deleteConfirmId === record.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1.5 rounded-lg bg-[#D4896A] text-white hover:bg-[#C4785A] transition-colors"
                        title="确认删除"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1.5 rounded-lg bg-[#E8D8C4] text-[#6B5A4A] hover:bg-[#D8C8B4] transition-colors"
                        title="取消"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(record.id)}
                      className="p-2 rounded-xl text-[#8B7A6A] hover:bg-[#F5EBDC] hover:text-[#D4896A] transition-all"
                      title="删除记录"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#5C4A3A]/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#F0E6D8] max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-[#F0E6D8] flex items-center justify-between">
              <h2
                className="text-xl font-bold text-[#5C4A3A]"
                style={{ fontFamily: "'LXGW WenKai', system-ui, serif" }}
              >
                添加清洁记录
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-[#8B7A6A] hover:bg-[#F5EBDC] hover:text-[#5C4A3A] transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  猫砂盆 <span className="text-[#D4896A]">*</span>
                </label>
                <select
                  value={formBox}
                  onChange={(e) => setFormBox(e.target.value)}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl border text-[#5C4A3A] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4896A]/30 transition-all',
                    formBox
                      ? 'border-[#E8D8C4] bg-[#FAF5EC] focus:border-[#D4896A]'
                      : 'border-[#D4896A]/50 bg-[#FAF5EC] focus:border-[#D4896A]'
                  )}
                >
                  <option value="">请选择猫砂盆</option>
                  {litterBoxes.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}（{b.location}）
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  负责人
                </label>
                <select
                  value={formMember}
                  onChange={(e) => setFormMember(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8D8C4] bg-[#FAF5EC] text-[#5C4A3A] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4896A]/30 focus:border-[#D4896A] transition-all"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.avatar} {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  清理时间
                </label>
                <input
                  type="datetime-local"
                  value={formCleanTime}
                  onChange={(e) => setFormCleanTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8D8C4] bg-[#FAF5EC] text-[#5C4A3A] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4896A]/30 focus:border-[#D4896A] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  异味等级
                </label>
                <div className="px-2 py-3 rounded-xl bg-[#FAF5EC] border border-[#F0E6D8]">
                  <StarRating
                    value={formSmellLevel}
                    onChange={setFormSmellLevel}
                    size="lg"
                    interactive
                    showLabel
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  结团情况
                </label>
                <div className="flex gap-2">
                  {(['少', '中', '多'] as ClumpLevel[]).map((level) => {
                    const cc = clumpColorMap[level];
                    const active = formClumpLevel === level;
                    return (
                      <button
                        key={level}
                        onClick={() => setFormClumpLevel(level)}
                        className={cn(
                          'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all',
                          active
                            ? 'scale-105 shadow-sm'
                            : 'bg-white border-[#E8D8C4] text-[#8B7A6A] hover:bg-[#FAF5EC]'
                        )}
                        style={
                          active
                            ? {
                                backgroundColor: cc.bg,
                                color: cc.text,
                                borderColor: cc.text,
                              }
                            : undefined
                        }
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[#FAF5EC] border border-[#F0E6D8]">
                <div>
                  <div className="text-sm font-medium text-[#5C4A3A]">是否补砂</div>
                  <div className="text-xs text-[#8B7A6A]">添加新的猫砂</div>
                </div>
                <button
                  onClick={() => {
                    if (!formIsFullChange) {
                      setFormAddedLitter(!formAddedLitter);
                    }
                  }}
                  disabled={formIsFullChange}
                  className={cn(
                    'relative w-12 h-7 rounded-full transition-all',
                    formAddedLitter ? 'bg-[#A8C5A0]' : 'bg-[#E8D8C4]',
                    formIsFullChange ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all',
                      formAddedLitter ? 'left-[22px]' : 'left-0.5'
                    )}
                  />
                </button>
              </div>

              {formAddedLitter && !formIsFullChange && (
                <div>
                  <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                    补砂克数（g）
                  </label>
                  <input
                    type="number"
                    value={formAddedAmount}
                    onChange={(e) =>
                      setFormAddedAmount(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    min={0}
                    step={50}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8D8C4] bg-[#FAF5EC] text-[#5C4A3A] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4896A]/30 focus:border-[#D4896A] transition-all"
                  />
                </div>
              )}

              <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[#FAF5EC] border border-[#F0E6D8]">
                <div>
                  <div className="text-sm font-medium text-[#5C4A3A]">是否整盆换砂</div>
                  <div className="text-xs text-[#8B7A6A]">全部倒掉重新装新砂</div>
                </div>
                <button
                  onClick={() => handleFullChangeToggle(!formIsFullChange)}
                  className={cn(
                    'relative w-12 h-7 rounded-full transition-all cursor-pointer',
                    formIsFullChange ? 'bg-[#8BA4B8]' : 'bg-[#E8D8C4]'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all',
                      formIsFullChange ? 'left-[22px]' : 'left-0.5'
                    )}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  备注（可选）
                </label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  rows={3}
                  placeholder="写点什么..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E8D8C4] bg-[#FAF5EC] text-[#5C4A3A] text-sm placeholder:text-[#B8A898] focus:outline-none focus:ring-2 focus:ring-[#D4896A]/30 focus:border-[#D4896A] transition-all resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-[#F0E6D8] flex items-center gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-5 py-2.5 rounded-xl border border-[#E8D8C4] text-[#6B5A4A] font-medium hover:bg-[#FAF5EC] transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formBox}
                className={cn(
                  'flex-1 px-5 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
                  formBox
                    ? 'bg-[#D4896A] text-white hover:bg-[#C4785A] active:scale-95 shadow-sm hover:shadow-md'
                    : 'bg-[#E8D8C4] text-[#B8A898] cursor-not-allowed'
                )}
              >
                <Check size={18} />
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
