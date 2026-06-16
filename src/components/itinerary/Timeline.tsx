import { ItineraryStep } from '../../types';
import { TimelineItem } from './TimelineItem';

interface TimelineProps {
  steps: ItineraryStep[];
  onEdit: (step: ItineraryStep) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export function Timeline({ steps, onEdit, onDelete, onMoveUp, onMoveDown }: TimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div className="relative">
      {sortedSteps.map((step, index) => (
        <TimelineItem
          key={step.id}
          step={step}
          index={index}
          total={sortedSteps.length}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      ))}
    </div>
  );
}
