import React, { useEffect } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import PropertyPanel from './components/PropertyPanel';
import LayerPanel from './components/LayerPanel';
import TopBar from './components/TopBar';
import { useEditorStore } from './store';

const App: React.FC = () => {
  const { getActiveDoc, setActiveDocId, documents, autoSave } = useEditorStore();

  useEffect(() => {
    if (documents.length > 0 && !useEditorStore.getState().activeDocId) {
      setActiveDocId(documents[0].id);
    }
  }, [documents]);

  useEffect(() => {
    const interval = setInterval(() => {
      autoSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      autoSave();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSave]);

  return (
    <div className="app">
      <TopBar />
      <div className="app-body">
        <Toolbar />
        <Canvas />
        <div className="right-panels">
          <PropertyPanel />
          <LayerPanel />
        </div>
      </div>
    </div>
  );
};

export default App;
