import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Filter, SortAsc, SortDesc } from 'lucide-react';
import useAppStore from '@/store/useAppStore';
import ClothingCard from '@/components/ClothingCard';
import ProcessIcon from '@/components/ProcessIcon';
import { ProcessType, PROCESS_LABELS, ClothingStatus } from '@/types';

type SortField = 'priority' | 'deadline' | 'createdAt';

const processTabs: { value: ProcessType | 'all'; label: string; icon?: ProcessType }[] = [
  { value: 'all', label: '全部' },
  { value: 'sew_button', label: '缝扣', icon: 'sew_button' },
  { value: 'patch_hole', label: '补洞', icon: 'patch_hole' },
  { value: 'alter_length', label: '改裤长', icon: 'alter_length' },
  { value: 'replace_zipper', label: '换拉链', icon: 'replace_zipper' },
  { value: 'iron', label: '熨烫', icon: 'iron' },
];

const statusTabs: { value: ClothingStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
];

const TaskQueue = () => {
  const navigate = useNavigate();
  const { clothings } = useAppStore();

  const [activeProcess, setActiveProcess] = useState<ProcessType | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<ClothingStatus | 'all'>('pending');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredAndSortedClothings = useMemo(() => {
    let filtered = [...clothings];

    if (activeProcess !== 'all') {
      filtered = filtered.filter((c) => c.processType === activeProcess);
    }

    if (activeStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === activeStatus);
    }

    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 0, normal: 1, low: 2 };
      let comparison = 0;

      if (sortField === 'priority') {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortField === 'deadline') {
        comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortAsc ? comparison : -comparison;
    });

    return filtered;
  }, [clothings, activeProcess, activeStatus, sortField, sortAsc]);

  const counts = useMemo(() => {
    return {
      all: clothings.filter((c) => c.status !== 'completed').length,
      sew_button: clothings.filter(
        (c) => c.processType === 'sew_button' && c.status !== 'completed'
      ).length,
      patch_hole: clothings.filter(
        (c) => c.processType === 'patch_hole' && c.status !== 'completed'
      ).length,
      alter_length: clothings.filter(
        (c) => c.processType === 'alter_length' && c.status !== 'completed'
      ).length,
      replace_zipper: clothings.filter(
        (c) => c.processType === 'replace_zipper' && c.status !== 'completed'
      ).length,
      iron: clothings.filter(
        (c) => c.processType === 'iron' && c.status !== 'completed'
      ).length,
    };
  }, [clothings]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortButtons: { field: SortField; label: string }[] = [
    { field: 'priority', label: '优先级' },
    { field: 'deadline', label: '截止日期' },
    { field: 'createdAt', label: '创建时间' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 stagger-item">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-brown-100 flex items-center justify-center hover:bg-brown-200 transition-colors md:hidden"
          >
            <ArrowLeft className="w-5 h-5 text-brown-700" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-brown-900">
              📋 任务队列
            </h1>
            <p className="text-brown-500 text-sm">
              共 {filteredAndSortedClothings.length} 件衣物
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/register')}
          className="btn-primary flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="hidden sm:inline">登记新衣物</span>
        </button>
      </div>

      <div className="sticky top-20 bg-cream/80 backdrop-blur-md -mx-4 px-4 py-4 z-30 stagger-item animate-delay-100">
        <div className="flex overflow-x-auto gap-2 pb-2 -mx-2 px-2">
          {processTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveProcess(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeProcess === tab.value
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-brown-600 hover:bg-brown-50'
              }`}
            >
              {tab.icon && <ProcessIcon type={tab.icon} size="sm" />}
              <span className="font-medium">{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeProcess === tab.value
                    ? 'bg-white/20 text-white'
                    : 'bg-brown-100 text-brown-500'
                }`}
              >
                {counts[tab.value as keyof typeof counts] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          <div className="flex gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeStatus === tab.value
                    ? 'bg-brown-800 text-white'
                    : 'bg-white text-brown-600 hover:bg-brown-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brown-400" />
            <span className="text-sm text-brown-500">排序：</span>
            <div className="flex gap-1">
              {sortButtons.map((btn) => (
                <button
                  key={btn.field}
                  onClick={() => handleSortChange(btn.field)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    sortField === btn.field
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-white text-brown-600 hover:bg-brown-50'
                  }`}
                >
                  {btn.label}
                  {sortField === btn.field &&
                    (sortAsc ? (
                      <SortAsc className="w-3.5 h-3.5" />
                    ) : (
                      <SortDesc className="w-3.5 h-3.5" />
                    ))}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filteredAndSortedClothings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedClothings.map((clothing, index) => (
            <ClothingCard
              key={clothing.id}
              clothing={clothing}
              style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
            />
          ))}
        </div>
      ) : (
        <div className="card-no-hover p-16 text-center stagger-item animate-delay-300">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brown-100 flex items-center justify-center">
            <PlusCircle className="w-10 h-10 text-brown-400" />
          </div>
          <h3 className="font-display text-xl font-semibold text-brown-700 mb-2">
            暂无衣物
          </h3>
          <p className="text-brown-500 mb-6">
            当前筛选条件下没有衣物，试试切换其他筛选条件
          </p>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            登记新衣物
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskQueue;
