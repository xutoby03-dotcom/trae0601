import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useEquipmentStore } from '../../store/equipmentStore';
import { useMissionStore } from '../../store/missionStore';
import { useRecordStore } from '../../store/recordStore';

export function Layout() {
  const initEquipment = useEquipmentStore((state) => state.init);
  const initMissions = useMissionStore((state) => state.init);
  const initRecords = useRecordStore((state) => state.init);

  useEffect(() => {
    initEquipment();
    initMissions();
    initRecords();
  }, [initEquipment, initMissions, initRecords]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="min-h-screen p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
