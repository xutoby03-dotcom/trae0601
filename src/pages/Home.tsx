import { useEffect, useState, useRef } from 'react';
import { useSandboxStore } from '@/store/useSandboxStore';
import { Toolbar } from '@/components/Toolbar';
import { PropertyPanel } from '@/components/PropertyPanel';
import { VersionPanel } from '@/components/VersionPanel';
import { SandboxBoard } from '@/components/SandboxBoard';
import { CompareView } from '@/components/CompareView';
import { PlaybackBar } from '@/components/PlaybackBar';

export default function Home() {
  const isPlaybackMode = useSandboxStore((s) => s.isPlaybackMode);
  const sceneVersions = useSandboxStore((s) => s.scene.versions);
  const initScene = useSandboxStore((s) => s.initScene);
  const startCompare = useSandboxStore((s) => s.startCompare);
  const endCompare = useSandboxStore((s) => s.endCompare);

  const [showCompare, setShowCompare] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initScene();
      initialized.current = true;
    }
  }, [initScene]);

  const openCompareWithVersions = (leftId?: string, rightId?: string) => {
    if (sceneVersions.length < 2) {
      alert('至少需要2个版本才能对比');
      return;
    }

    const sorted = [...sceneVersions].sort((a, b) => a.stepNumber - b.stepNumber);

    const finalLeft = leftId || sorted[sorted.length - 2].id;
    const finalRight = rightId || sorted[sorted.length - 1].id;

    startCompare(finalLeft, finalRight);
    setShowCompare(true);
  };

  const handleOpenCompare = () => {
    openCompareWithVersions();
  };

  const handleCloseCompare = () => {
    setShowCompare(false);
    endCompare();
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      <Toolbar onOpenCompare={handleOpenCompare} />

      <div className="flex-1 flex overflow-hidden relative">
        {!isPlaybackMode && <PropertyPanel />}

        <main className="flex-1 flex items-center justify-center relative overflow-auto">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, rgba(245, 158, 11, 0.08) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 40%)',
            }}
          />

          <div className="relative z-10">
            <SandboxBoard
              cellSize={56}
              gridCols={12}
              gridRows={10}
              readOnly={isPlaybackMode}
            />
          </div>

          {isPlaybackMode && <PlaybackBar />}
        </main>

        {!isPlaybackMode && (
          <VersionPanel onStartCompare={openCompareWithVersions} />
        )}
      </div>

      {showCompare && <CompareView onClose={handleCloseCompare} />}
    </div>
  );
}
