import { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header/Header';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { CropTool } from '../components/Toolbar/CropTool';
import { TextTool } from '../components/Toolbar/TextTool';
import { MosaicTool } from '../components/Toolbar/MosaicTool';
import { DrawingTool } from '../components/Toolbar/DrawingTool';
import { LassoTool } from '../components/Toolbar/LassoTool';
import { MainCanvas } from '../components/Canvas/MainCanvas';
import { FilterPanel } from '../components/Filters/FilterPanel';
import { LayerList } from '../components/Layers/LayerList';
import { Histogram } from '../components/Histogram/Histogram';
import { ExportDialog } from '../components/Export/ExportDialog';
import { BatchProcess } from '../components/Export/BatchProcess';
import { useEditorStore } from '../store/editorStore';
import type { ToolType } from '../types';

export default function Home() {
  const [showExport, setShowExport] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const { activeTool, selectedLayerId, undo, redo, getSelectedLayer } = useEditorStore();

  const selectedLayer = getSelectedLayer();
  const showTextPanel = activeTool === 'text' || (selectedLayer?.type === 'text');

  const getToolPanelPosition = (tool: ToolType) => {
    const positions: Record<ToolType, number> = {
      select: 0,
      crop: 64,
      rotate: 112,
      flip: 160,
      text: 208,
      mosaic: 256,
      drawing: 304,
      lasso: 352,
    };
    return positions[tool] || 0;
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault();
        if (selectedLayerId) {
          undo(selectedLayerId);
        }
      } else if (e.key === 'y') {
        e.preventDefault();
        if (selectedLayerId) {
          redo(selectedLayerId);
        }
      } else if (e.key === 's') {
        e.preventDefault();
        setShowExport(true);
      }
    }
  }, [selectedLayerId, undo, redo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1a1a1a]">
      <Header onExport={() => setShowExport(true)} onBatch={() => setShowBatch(true)} />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="relative">
          <Toolbar />
          
          {activeTool === 'crop' && (
            <div className="absolute top-0 left-16 z-20">
              <CropTool />
            </div>
          )}
          
          {showTextPanel && (
            <div className="absolute top-0 left-16 z-20" style={{ top: getToolPanelPosition('text') }}>
              <TextTool />
            </div>
          )}
          
          {activeTool === 'mosaic' && (
            <div className="absolute top-0 left-16 z-20" style={{ top: getToolPanelPosition('mosaic') }}>
              <MosaicTool />
            </div>
          )}
          
          {activeTool === 'drawing' && (
            <div className="absolute top-0 left-16 z-20" style={{ top: getToolPanelPosition('drawing') }}>
              <DrawingTool />
            </div>
          )}
          
          {activeTool === 'lasso' && (
            <div className="absolute top-0 left-16 z-20" style={{ top: getToolPanelPosition('lasso') }}>
              <LassoTool />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <LayerList />
          
          <div className="flex-1 flex overflow-hidden">
            <MainCanvas />
            <FilterPanel />
          </div>
          
          <Histogram />
        </div>
      </div>

      {showExport && (
        <ExportDialog onClose={() => setShowExport(false)} />
      )}
      
      {showBatch && (
        <BatchProcess onClose={() => setShowBatch(false)} />
      )}
    </div>
  );
}
