import React, { useEffect, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { useEditorStore } from './store/useEditorStore';
import { ShapeType } from './types';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { loadFromLocalStorage, saveToLocalStorage, nodes, edges, selection } = useEditorStore();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage();
    }, 500);
    return () => clearTimeout(timer);
  }, [nodes, edges, saveToLocalStorage]);

  const handleDragStart = (type: ShapeType) => {
    console.log('Dragging shape:', type);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
      }}
    >
      <Toolbar canvasRef={canvasRef} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar onDragStart={handleDragStart} />
        <Canvas canvasRef={canvasRef} />
      </div>
    </div>
  );
};

export default App;
