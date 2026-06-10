import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Archive,
  Sparkles,
  Gift,
  Plus,
  AlertTriangle,
  BarChart3,
  CloudRain,
  Heart,
  Moon,
  Users,
  X,
  Trash2,
  UserPlus,
  Baby,
} from 'lucide-react';
import { useToyStore } from '@/store/useToyStore';
import { ToyCard } from '@/components/ToyCard';
import { cn, formatAge, calculateAgeInMonths, parseAgeRange } from '@/lib/utils';
import type { ToyStatus, ToyTag, Child } from '@/types';
import { STATUS_LABELS, TAG_LABELS } from '@/types';

const statusGroups: { status: ToyStatus; icon: typeof Play; color: string; bgColor: string }[] = [
  { status: 'playing', icon: Play, color: 'text-mint-600', bgColor: 'bg-mint-100' },
  { status: 'stored', icon: Archive, color: 'text-sky-600', bgColor: 'bg-sky-100' },
  { status: 'cleaning', icon: Sparkles, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { status: 'giving', icon: Gift, color: 'text-pink-600', bgColor: 'bg-pink-100' },
];

const tagFilters: { tag: ToyTag; icon: typeof CloudRain }[] = [
  { tag: 'rainy', icon: CloudRain },
  { tag: 'parent-child', icon: Heart },
  { tag: 'quiet', icon: Moon },
];

export default function Home() {
  const {
    toys,
    children,
    getToysByStatus,
    getToysByTag,
    getSmallPartsRiskToys,
    addChild,
    updateChild,
    deleteChild,
  } = useToyStore();

  const [activeFilter, setActiveFilter] = useState<ToyStatus | 'all' | ToyTag>('all');
  const [filterType, setFilterType] = useState<'status' | 'tag'>('status');
  const [showChildModal, setShowChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthDate, setNewChildBirthDate] = useState('');

  const riskToys = getSmallPartsRiskToys();
  const showSafetyWarning = riskToys.length > 0 && children.length > 0;

  const getFilteredToys = () => {
    if (activeFilter === 'all') {
      return toys.filter((t) => t.status !== 'away');
    }
    if (filterType === 'status') {
      return getToysByStatus(activeFilter as ToyStatus);
    }
    return getToysByTag(activeFilter as ToyTag).filter((t) => t.status !== 'away');
  };

  const filteredToys = getFilteredToys();

  const handleStatusClick = (status: ToyStatus) => {
    setFilterType('status');
    setActiveFilter(status === activeFilter ? 'all' : status);
  };

  const handleTagClick = (tag: ToyTag) => {
    setFilterType('tag');
    setActiveFilter(tag === activeFilter ? 'all' : tag);
  };

  const openAddChild = () => {
    setEditingChild(null);
    setNewChildName('');
    setNewChildBirthDate('');
    setShowChildModal(true);
  };

  const openEditChild = (child: Child) => {
    setEditingChild(child);
    setNewChildName(child.name);
    setNewChildBirthDate(child.birthDate);
    setShowChildModal(true);
  };

  const handleSaveChild = () => {
    if (!newChildName.trim() || !newChildBirthDate) {
      alert('请填写孩子姓名和出生日期');
      return;
    }

    if (editingChild) {
      updateChild(editingChild.id, {
        name: newChildName.trim(),
        birthDate: newChildBirthDate,
      });
    } else {
      addChild({
        name: newChildName.trim(),
        birthDate: newChildBirthDate,
      });
    }
    setShowChildModal(false);
  };

  const handleDeleteChild = (id: string) => {
    if (confirm('确定要删除这个孩子吗？')) {
      deleteChild(id);
    }
  };

  const getRiskChildrenNames = () => {
    const names = new Set<string>();
    riskToys.forEach((toy) => {
      const { isEmpty } = parseAgeRange(toy.ageRange);
      if (isEmpty) {
        children.forEach((child) => names.add(child.name));
        return;
      }
      children.forEach((child) => {
        const toyMinAge = parseInt(toy.ageRange.match(/\d+/)?.[0] || '0');
        const childAgeMonths = calculateAgeInMonths(child.birthDate);
        if (childAgeMonths < toyMinAge * 12) {
          names.add(child.name);
        }
      });
    });
    return Array.from(names);
  };

  const hasUnsetAgeToys = riskToys.some((toy) => parseAgeRange(toy.ageRange).isEmpty);
  const unsetAgeToys = riskToys.filter((toy) => parseAgeRange(toy.ageRange).isEmpty);
  const normalRiskToys = riskToys.filter((toy) => !parseAgeRange(toy.ageRange).isEmpty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-mint-50">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🧸 玩具轮换箱</h1>
            <p className="text-sm text-gray-500 mt-1">让每一件玩具都被好好利用</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openAddChild}
              className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow relative"
              title="孩子年龄设置"
            >
              <Users className="text-primary-500" size={22} />
              {children.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {children.length}
                </span>
              )}
            </button>
            <Link
              to="/stats"
              className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <BarChart3 className="text-primary-500" size={22} />
            </Link>
          </div>
        </div>

        {/* 孩子信息展示 */}
        {children.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => openEditChild(child)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-sm"
              >
                <Baby size={14} className="text-pink-500" />
                <span className="font-medium text-gray-700">{child.name}</span>
                <span className="text-gray-400">
                  ({formatAge(calculateAgeInMonths(child.birthDate))})
                </span>
              </button>
            ))}
          </div>
        )}

        {/* 安全提醒 */}
        {showSafetyWarning && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-medium text-red-800 text-sm">⚠️ 小零件安全提醒</p>
                <p className="text-red-600 text-xs mt-0.5">
                  当前有 <strong>{riskToys.length}</strong> 件含小零件的玩具正在玩，
                  {getRiskChildrenNames().length > 0 && (
                    <>
                      对 <strong>{getRiskChildrenNames().join('、')}</strong> 存在误食风险，
                    </>
                  )}
                  请务必在成人看护下玩耍！
                </p>
                {hasUnsetAgeToys && (
                  <p className="text-orange-600 text-xs mt-1 bg-orange-50 px-2 py-1 rounded">
                    ⚠️ 有 <strong>{unsetAgeToys.length}</strong> 件玩具未填写适合年龄，暂按全部孩子有风险处理，
                    请点击玩具卡片补充适龄信息。
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {normalRiskToys.map((toy) => (
                    <Link
                      key={toy.id}
                      to={`/toy/${toy.id}`}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full hover:bg-red-200 transition-colors"
                    >
                      {toy.name}（{toy.ageRange}+）
                    </Link>
                  ))}
                  {unsetAgeToys.map((toy) => (
                    <Link
                      key={toy.id}
                      to={`/toy/${toy.id}`}
                      className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full hover:bg-orange-200 transition-colors"
                    >
                      {toy.name}（未填适龄 ⚠️）
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 未设置孩子时的提示 */}
        {children.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Users className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-medium text-yellow-800 text-sm">设置孩子年龄</p>
                <p className="text-yellow-600 text-xs mt-0.5">
                  添加孩子信息后，系统会自动判断含小零件玩具是否适合，并提供安全提醒。
                </p>
                <button
                  onClick={openAddChild}
                  className="mt-2 text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  添加孩子信息
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 状态分组卡片 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {statusGroups.map(({ status, icon: Icon, color, bgColor }) => {
            const count = getToysByStatus(status).length;
            const isActive = filterType === 'status' && activeFilter === status;
            return (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300',
                  isActive
                    ? `${bgColor} ring-2 ring-offset-2 ring-primary-400 scale-105`
                    : 'bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5'
                )}
              >
                <div className={cn('p-2.5 rounded-xl', bgColor)}>
                  <Icon className={color} size={24} />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{STATUS_LABELS[status]}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* 场景筛选标签 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tagFilters.map(({ tag, icon: Icon }) => {
            const isActive = filterType === 'tag' && activeFilter === tag;
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                )}
              >
                <Icon size={16} />
                {TAG_LABELS[tag]}
              </button>
            );
          })}
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="text-sm text-gray-500 hover:text-gray-700 px-2"
            >
              清除筛选
            </button>
          )}
        </div>

        {/* 玩具列表标题 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">
            {activeFilter === 'all'
              ? '全部玩具'
              : filterType === 'status'
              ? STATUS_LABELS[activeFilter as ToyStatus]
              : TAG_LABELS[activeFilter as ToyTag]}
            <span className="text-gray-400 font-normal text-sm ml-2">
              ({filteredToys.length})
            </span>
          </h2>
        </div>

        {/* 玩具卡片网格 */}
        {filteredToys.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredToys.map((toy) => (
              <ToyCard key={toy.id} toy={toy} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500">这里还没有玩具</p>
            <p className="text-gray-400 text-sm mt-1">点击下方按钮添加第一件玩具吧</p>
          </div>
        )}
      </div>

      {/* 底部添加按钮 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Link
          to="/add"
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          <span className="font-medium">添加玩具</span>
        </Link>
      </div>

      {/* 孩子设置弹窗 */}
      {showChildModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6 animate-fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800 text-lg">
                {editingChild ? '编辑孩子信息' : '添加孩子'}
              </h3>
              <button
                onClick={() => setShowChildModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* 已有孩子列表 */}
            {!editingChild && children.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">已有孩子</p>
                <div className="space-y-2">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <Baby size={18} className="text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{child.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatAge(calculateAgeInMonths(child.birthDate))}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditChild(child)}
                          className="p-2 text-gray-500 hover:bg-white rounded-lg transition-colors"
                        >
                          <Users size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteChild(child.id)}
                          className="p-2 text-red-400 hover:bg-white hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 表单 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  孩子姓名
                </label>
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="如：小明"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  出生日期
                </label>
                <input
                  type="date"
                  value={newChildBirthDate}
                  onChange={(e) => setNewChildBirthDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowChildModal(false);
                  setEditingChild(null);
                }}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveChild}
                className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-1.5"
              >
                {editingChild ? null : <UserPlus size={18} />}
                {editingChild ? '保存修改' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
