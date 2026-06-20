import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Star, GripVertical, Clock, MapPin, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useGuideStore } from '@/store/useGuideStore';
import { formatDurationChinese } from '@/utils/time';
import type { RoutePoint } from '@/types';
import { cn } from '@/lib/utils';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function createEmptyPoint(order: number): RoutePoint {
  return {
    id: generateId(),
    name: '',
    description: '',
    plannedDuration: 180,
    isKeyPoint: false,
    order,
  };
}

interface SortablePointItemProps {
  point: RoutePoint;
  index: number;
  onUpdate: (id: string, updates: Partial<RoutePoint>) => void;
  onDelete: (id: string) => void;
  errors?: { name?: string; duration?: string };
}

function SortablePointItem({ point, index, onUpdate, onDelete, errors }: SortablePointItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: point.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const minutes = Math.floor(point.plannedDuration / 60);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'glass-card p-4 flex items-center gap-3',
        isDragging && 'opacity-50 shadow-xl z-10'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-deep-300 hover:text-deep-600 cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="w-8 h-8 rounded-full bg-deep-100 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-medium text-deep-700">{index + 1}</span>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-6">
          <input
            type="text"
            value={point.name}
            onChange={(e) => onUpdate(point.id, { name: e.target.value })}
            placeholder="点位名称"
            className={cn(
              'input-field',
              errors?.name && 'border-coral-500 focus:border-coral-500 focus:ring-coral-500/20'
            )}
          />
          {errors?.name && (
            <p className="text-xs text-coral-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.name}
            </p>
          )}
        </div>

        <div className="sm:col-span-3">
          <div className="relative">
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => {
                const mins = Math.max(1, parseInt(e.target.value) || 1);
                onUpdate(point.id, { plannedDuration: mins * 60 });
              }}
              className={cn(
                'input-field pr-10',
                errors?.duration && 'border-coral-500 focus:border-coral-500 focus:ring-coral-500/20'
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-deep-400 text-sm">
              分钟
            </div>
          </div>
        </div>

        <div className="sm:col-span-3 flex items-center justify-end gap-2">
          <button
            onClick={() => onUpdate(point.id, { isKeyPoint: !point.isKeyPoint })}
            className={cn(
              'p-2 rounded-lg transition-all',
              point.isKeyPoint
                ? 'text-coral-500 bg-coral-500/10'
                : 'text-deep-300 hover:text-coral-500 hover:bg-deep-100'
            )}
            title={point.isKeyPoint ? '取消重点' : '设为重点'}
          >
            <Star className={cn('w-5 h-5', point.isKeyPoint && 'fill-current')} />
          </button>
          <button
            onClick={() => onDelete(point.id)}
            className="p-2 rounded-lg text-deep-300 hover:text-coral-500 hover:bg-coral-500/10 transition-all"
            title="删除点位"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RouteEditor() {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { getRouteById, createRoute, updateRoute, loadRoutes } = useGuideStore();

  const isEditMode = location.pathname.match(/^\/routes\/[^/]+\/edit$/) !== null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [errors, setErrors] = useState<{ name?: string; points?: Record<string, { name?: string; duration?: string }> }>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  useEffect(() => {
    if (isEditMode && id) {
      const route = getRouteById(id);
      if (route) {
        setName(route.name);
        setDescription(route.description || '');
        setPoints([...route.points].sort((a, b) => a.order - b.order));
      } else {
        navigate('/routes', { replace: true });
      }
    }
  }, [isEditMode, id, getRouteById, navigate]);

  const totalDuration = useMemo(() => {
    return points.reduce((sum, p) => sum + p.plannedDuration, 0);
  }, [points]);

  const keyPointCount = useMemo(() => {
    return points.filter((p) => p.isKeyPoint).length;
  }, [points]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPoints((items) => {
        const oldIndex = items.findIndex((p) => p.id === active.id);
        const newIndex = items.findIndex((p) => p.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((p, idx) => ({ ...p, order: idx }));
      });
    }
  };

  const handleAddPoint = () => {
    setPoints((prev) => [...prev, createEmptyPoint(prev.length)]);
  };

  const handleUpdatePoint = (pointId: string, updates: Partial<RoutePoint>) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === pointId ? { ...p, ...updates } : p))
    );
    setErrors((prev) => {
      if (prev.points?.[pointId]) {
        const newPoints = { ...prev.points };
        delete newPoints[pointId];
        return { ...prev, points: Object.keys(newPoints).length > 0 ? newPoints : undefined };
      }
      return prev;
    });
  };

  const handleDeletePoint = (pointId: string) => {
    setPoints((prev) => {
      const filtered = prev.filter((p) => p.id !== pointId);
      return filtered.map((p, idx) => ({ ...p, order: idx }));
    });
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = '请输入路线名称';
    }

    if (points.length === 0) {
      newErrors.points = {};
    } else {
      const pointErrors: Record<string, { name?: string; duration?: string }> = {};
      points.forEach((p) => {
        const pe: { name?: string; duration?: string } = {};
        if (!p.name.trim()) {
          pe.name = '请输入点位名称';
        }
        if (p.plannedDuration <= 0) {
          pe.duration = '时长必须大于0';
        }
        if (Object.keys(pe).length > 0) {
          pointErrors[p.id] = pe;
        }
      });
      if (Object.keys(pointErrors).length > 0) {
        newErrors.points = pointErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const routeData = {
      name: name.trim(),
      description: description.trim(),
      points: points.map((p, idx) => ({ ...p, order: idx })),
    };

    if (isEditMode && id) {
      updateRoute(id, routeData);
    } else {
      createRoute(routeData);
    }

    navigate('/routes');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title={isEditMode ? '编辑路线' : '新建路线'} />

      <main className="flex-1 container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-deep-900">
            {isEditMode ? '编辑路线' : '新建路线'}
          </h1>
          <p className="text-deep-600 mt-1">
            {isEditMode ? '修改路线信息和点位配置' : '创建一条新的讲解路线'}
          </p>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6 space-y-5">
            <div>
              <label className="label-text">
                路线名称 <span className="text-coral-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder="例如：青铜器展厅路线"
                className={cn(
                  'input-field',
                  errors.name && 'border-coral-500 focus:border-coral-500 focus:ring-coral-500/20'
                )}
              />
              {errors.name && (
                <p className="text-sm text-coral-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="label-text">路线描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简要描述这条路线的内容和特点"
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-museum-500" />
                <h2 className="text-lg font-semibold text-deep-900">讲解点位</h2>
              </div>
              <div className="flex items-center gap-4 text-sm text-deep-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>总时长：{formatDurationChinese(totalDuration)}</span>
                </div>
                {keyPointCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-coral-500 fill-coral-500" />
                    <span>{keyPointCount} 个重点</span>
                  </div>
                )}
              </div>
            </div>

            {points.length === 0 ? (
              <div className="border-2 border-dashed border-museum-200 rounded-xl p-12 text-center mb-5">
                <MapPin className="w-12 h-12 text-deep-300 mx-auto mb-3" />
                <p className="text-deep-600 mb-1">还没有添加点位</p>
                <p className="text-sm text-deep-400">点击下方按钮添加第一个讲解点位</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={points.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 mb-5">
                    {points.map((point, index) => (
                      <SortablePointItem
                        key={point.id}
                        point={point}
                        index={index}
                        onUpdate={handleUpdatePoint}
                        onDelete={handleDeletePoint}
                        errors={errors.points?.[point.id]}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {errors.points && points.length === 0 && (
              <p className="text-sm text-coral-500 mb-4 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                请至少添加一个点位
              </p>
            )}

            <button
              onClick={handleAddPoint}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加点位
            </button>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button onClick={handleCancel} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSave} className="btn-primary">
              {isEditMode ? '保存修改' : '创建路线'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
