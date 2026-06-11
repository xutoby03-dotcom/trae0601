import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { ElderProfiles } from '@/components/ElderProfiles';
import { TaskBoard } from '@/components/TaskBoard';
import { RecordModal } from '@/components/RecordModal';
import { FamilyStats } from '@/components/FamilyStats';
import type { BathTask } from '@/types';

export default function Home() {
  const [recordTask, setRecordTask] = useState<BathTask | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BathTask | null>(null);
  const [preselectedElderId, setPreselectedElderId] = useState<string | undefined>(undefined);
  const [delayedFilterMemberId, setDelayedFilterMemberId] = useState<string | undefined>(undefined);
  const taskBoardRef = useRef<HTMLElement>(null);

  const openNewTask = (elderId?: string) => {
    setEditingTask(null);
    setPreselectedElderId(elderId);
    setTaskDrawerOpen(true);
  };

  const openRecord = (task: BathTask) => setRecordTask(task);

  const handleFilterDelayed = (memberId: string) => {
    setDelayedFilterMemberId(memberId);
    taskBoardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <Header onAddTask={() => openNewTask()} />

      <main className="pb-8">
        <ElderProfiles onAddTaskForElder={(id) => openNewTask(id)} />

        <TaskBoard
          ref={taskBoardRef}
          onCompleteTask={openRecord}
          drawerOpen={taskDrawerOpen}
          preselectedElderId={preselectedElderId}
          editingTask={editingTask}
          onDrawerOpenChange={setTaskDrawerOpen}
          onEditTask={setEditingTask}
          onClearPreselection={() => setPreselectedElderId(undefined)}
          delayedFilterMemberId={delayedFilterMemberId}
          onClearDelayedFilter={() => setDelayedFilterMemberId(undefined)}
        />

        <FamilyStats
          onArrangeForElder={(elderId) => openNewTask(elderId)}
          onFilterDelayedByMember={handleFilterDelayed}
        />
      </main>

      <RecordModal task={recordTask} onClose={() => setRecordTask(null)} />
    </div>
  );
}
