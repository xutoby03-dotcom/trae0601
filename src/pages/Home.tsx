import { useEffect } from 'react';
import Toolbar from '@/components/Editor/Toolbar';
import ComponentPanel from '@/components/Editor/ComponentPanel';
import Canvas from '@/components/Editor/Canvas';
import PropertiesPanel from '@/components/Editor/PropertiesPanel';
import ExportModal from '@/components/Editor/ExportModal';
import SendModal from '@/components/Editor/SendModal';
import TemplateLibrary from '@/components/Editor/TemplateLibrary';
import SavedTemplates from '@/components/Editor/SavedTemplates';
import VariableInsert from '@/components/Editor/VariableInsert';
import { useEmailStore } from '@/store/useEmailStore';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';

export default function Home() {
  const { previewMode, loadSavedTemplates } = useEmailStore();
  useKeyboardShortcuts();

  useEffect(() => {
    loadSavedTemplates();
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <ComponentPanel />
        <Canvas />
        <PropertiesPanel />
      </div>
      <ExportModal />
      <SendModal />
      <TemplateLibrary />
      <SavedTemplates />
      <VariableInsert />
    </div>
  );
}
