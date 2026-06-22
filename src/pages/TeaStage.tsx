import React, { useRef } from 'react';
import Toolbar from '@/components/Toolbar';
import ItemPanel from '@/components/ItemPanel';
import TeaCanvas, { TeaCanvasHandle } from '@/components/TeaCanvas';
import PropertyPanel from '@/components/PropertyPanel';
import DetectionPanel from '@/components/DetectionPanel';
import { ItemType } from '@/types';

const TeaStage: React.FC = () => {
  const canvasRef = useRef<TeaCanvasHandle>(null);

  const handleDragStart = (type: ItemType) => {
    console.log('开始拖拽:', type);
  };

  return (
    <div className="flex flex-col h-screen bg-stone-100">
      <Toolbar canvasRef={canvasRef} />
      <div className="flex-1 flex overflow-hidden">
        <ItemPanel onDragStart={handleDragStart} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TeaCanvas ref={canvasRef} />
          <DetectionPanel />
        </div>
        <PropertyPanel />
      </div>
    </div>
  );
};

export default TeaStage;
