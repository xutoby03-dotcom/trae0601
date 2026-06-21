import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trophy } from 'lucide-react';
import type { WaterSample } from '@/types';
import { getBlindCodeColor } from '@/utils/helpers';
import { cn } from '@/lib/utils';

interface SortableItemProps {
  sample: WaterSample;
  rank: number;
}

function SortableItem({ sample, rank }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sample.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
          <Trophy className="w-4 h-4 text-white" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-coffee-200 rounded-full flex items-center justify-center font-bold text-coffee-700">
        {rank}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-4 p-4 bg-white rounded-xl border-2 transition-all duration-200',
        isDragging
          ? 'border-coffee-500 shadow-soft-lg scale-[1.02]'
          : 'border-coffee-100 hover:border-coffee-300'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-coffee-400 hover:text-coffee-600 transition-colors p-1"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {getRankBadge(rank)}

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xl"
        style={{ backgroundColor: getBlindCodeColor(sample.blindCode) }}
      >
        {sample.blindCode}
      </div>

      <div className="flex-1">
        <p className="font-semibold text-coffee-900">水样 {sample.blindCode}</p>
        <p className="text-sm text-coffee-500">
          拖拽调整喜好排序
        </p>
      </div>
    </div>
  );
}

interface PreferenceRankerProps {
  samples: WaterSample[];
  ranks: Record<string, number>;
  onChange: (ranks: Record<string, number>) => void;
}

export function PreferenceRanker({ samples, ranks, onChange }: PreferenceRankerProps) {
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

  const sortedSamples = [...samples].sort((a, b) => {
    return (ranks[a.id] || samples.length) - (ranks[b.id] || samples.length);
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedSamples.findIndex((s) => s.id === active.id);
      const newIndex = sortedSamples.findIndex((s) => s.id === over.id);

      const newSorted = arrayMove(sortedSamples, oldIndex, newIndex);

      const newRanks: Record<string, number> = {};
      newSorted.forEach((sample, index) => {
        newRanks[sample.id] = index + 1;
      });

      onChange(newRanks);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-coffee-800 block">
          喜好排序
        </label>
        <p className="text-xs text-coffee-500 mt-1">
          拖拽卡片调整顺序，第一名是你最喜欢的
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSamples.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sortedSamples.map((sample) => (
              <SortableItem
                key={sample.id}
                sample={sample}
                rank={ranks[sample.id] || sortedSamples.indexOf(sample) + 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
