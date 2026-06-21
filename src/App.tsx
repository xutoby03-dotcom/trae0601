import { Routes, Route, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import TopNav from "@/components/layout/TopNav";
import Sidebar from "@/components/layout/Sidebar";
import DetailDrawer from "@/components/layout/DetailDrawer";
import MapView from "@/pages/MapView";
import LibraryView from "@/pages/LibraryView";
import ProjectView from "@/pages/ProjectView";
import LockModal from "@/components/project/LockModal";

export default function App() {
  const detailPanelOpen = useUIStore((s) => s.detailPanelOpen);

  return (
    <div className="h-screen w-screen overflow-hidden bg-forest-950 text-slate-100">
      <TopNav />

      <div className={cn("pt-[60px] h-full flex relative")}>
        <Sidebar />

        <main
          className={cn(
            "flex-1 ml-16 h-full transition-all duration-300 ease-out relative",
            detailPanelOpen ? "mr-[480px]" : "mr-0"
          )}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/map" replace />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/library" element={<LibraryView />} />
            <Route path="/projects" element={<ProjectView />} />
            <Route path="*" element={<Navigate to="/map" replace />} />
          </Routes>
        </main>

        <DetailDrawer />
      </div>

      <LockModal />
    </div>
  );
}
