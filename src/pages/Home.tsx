import { useState } from 'react';
import { Header } from '@/components/Header';
import { ElderProfiles } from '@/components/ElderProfiles';
import { TaskBoard } from '@/components/TaskBoard';
import { RecordModal } from '@/components/RecordModal';
import { FamilyStats } from '@/components/FamilyStats';
import type { BathTask } from '@/types';

export default function Home() {
  const [recordTask, setRecordTask] = useState<BathTask | null>(null);
  const [preselectedElderId, setPreselectedElderId] = useState<string | undefined>(undefined);

  const openRecord = (task: BathTask) => setRecordTask(task);

  return (
    <div className="min-h-screen bg-cream-100">
      <Header onAddTask={() => setPreselectedElderId(undefined)} />

      <main className="pb-8">
        <ElderProfiles onAddTaskForElder={(id) => setPreselectedElderId(id)} />

        <TaskBoard
          onCompleteTask={openRecord}
          onOpenNewTask={(id) => setPreselectedElderId(id ?? preselectedElderId)}
        />

        <FamilyStats />
      </main>

      <RecordModal task={recordTask} onClose={() => setRecordTask(null)} />

      {preselectedElderId && (
        <div className="hidden" ref={() => setPreselectedElderId(undefined)} />
      )}
    </div>
  );
}
