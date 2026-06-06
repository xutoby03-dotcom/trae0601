import { useEffect } from 'react';
import { HouseLayout } from '@/components/HouseLayout/HouseLayout';
import { DeviceModal } from '@/components/DeviceModal/DeviceModal';
import { VoiceControl } from '@/components/VoiceControl/VoiceControl';
import { SceneMode } from '@/components/SceneMode/SceneMode';
import { EnergyStats } from '@/components/EnergyStats/EnergyStats';
import { DeviceLog } from '@/components/DeviceLog/DeviceLog';
import { ToastContainer } from '@/components/Toast/ToastContainer';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { initDB } from '@/services/dbService';
import { useSmartHomeStore } from '@/store/useSmartHomeStore';
import { Home as HomeIcon } from 'lucide-react';

export default function Home() {
  const { loadLogs } = useSmartHomeStore();

  useEffect(() => {
    initDB()
      .then(() => loadLogs())
      .catch(console.error);
  }, [loadLogs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="fixed top-4 left-4 z-30 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/30">
          <HomeIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            智能家居
          </h1>
          <p className="text-xs text-gray-500">Smart Home Control</p>
        </div>
      </div>

      <SceneMode />
      <Sidebar />
      <ToastContainer />

      <div className="relative z-10 h-screen pb-32">
        <HouseLayout />
      </div>

      <VoiceControl />
      <DeviceModal />
      <EnergyStats />
      <DeviceLog />
    </div>
  );
}
