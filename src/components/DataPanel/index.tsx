import { useWindStore } from '../../store/useWindStore';
import { RealtimeData } from './RealtimeData';
import { PoleDetail } from './PoleDetail';

export const DataPanel = () => {
  const { selectedPoleId } = useWindStore();

  return (
    <div className="h-full flex flex-col gap-4">
      <RealtimeData />
      {selectedPoleId && <PoleDetail />}
    </div>
  );
};
