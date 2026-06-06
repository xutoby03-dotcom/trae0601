import { useEffect } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Editor from '../components/Editor/Editor';
import AnalysisPanel from '../components/AnalysisPanel/AnalysisPanel';
import TemplateModal from '../components/TemplateModal/TemplateModal';
import { useStore } from '../store/useStore';

export default function Home() {
  const { initApp } = useStore();

  useEffect(() => {
    initApp();
  }, [initApp]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#fafaf9]">
      <Sidebar />
      <Editor />
      <AnalysisPanel />
      <TemplateModal />
    </div>
  );
}
