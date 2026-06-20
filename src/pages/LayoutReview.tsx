import TopBar from '@/components/layout/TopBar';
import DeviceLibrary from '@/components/devices/DeviceLibrary';
import TopDownCanvas from '@/components/canvas/TopDownCanvas';
import ParamEditorPanel from '@/components/params/ParamEditorPanel';
import ImageCompareView from '@/components/compare/ImageCompareView';
import HistoryPanel from '@/components/history/HistoryPanel';
import ConflictModal from '@/components/booking/ConflictModal';
import { useState, useEffect } from 'react';

export default function LayoutReview() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-studio-950 text-studio-200 overflow-hidden">
      <div
        className="transition-all duration-700 ease-out"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(-6px)',
        }}
      >
        <TopBar />
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 flex">
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateX(0)' : 'translateX(-18px)',
              transitionDelay: '80ms',
            }}
          >
            <DeviceLibrary />
          </div>

          <main className="flex-1 min-w-0 flex flex-col">
            <div
              className="flex-1 min-h-0 flex flex-col transition-all duration-700 ease-out"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(18px)',
                transitionDelay: '160ms',
              }}
            >
              <TopDownCanvas />
            </div>
            <div
              className="h-[46%] min-h-[320px] transition-all duration-700 ease-out"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: '280ms',
              }}
            >
              <ImageCompareView />
            </div>
          </main>

          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateX(0)' : 'translateX(18px)',
              transitionDelay: '200ms',
            }}
          >
            <ParamEditorPanel />
          </div>
        </div>
      </div>

      <HistoryPanel />
      <ConflictModal />
    </div>
  );
}
