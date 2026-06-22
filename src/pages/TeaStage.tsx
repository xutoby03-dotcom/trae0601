import React from 'react';
import Toolbar from '@/components/Toolbar';
import ItemPanel from '@/components/ItemPanel';
import TeaCanvas from '@/components/TeaCanvas';
import PropertyPanel from '@/components/PropertyPanel';
import DetectionPanel from '@/components/DetectionPanel';
import { ItemType } from '@/types';

const TeaStage: React.FC = () => {
  const handleDragStart = (type: ItemType) => {
    console.log('开始拖拽:', type);
  };

  return (
    <div className="flex flex-col h-screen bg-stone-100">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <ItemPanel onDragStart={handleDragStart} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TeaCanvas />
          <DetectionPanel />
        </div>
        <PropertyPanel />
      </div>
    </div>
  );
};

export default TeaStage;
