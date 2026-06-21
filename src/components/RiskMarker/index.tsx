import { useWindStore } from '../../store/useWindStore';
import { MarkerMenu } from './MarkerMenu';

export const RiskMarker = () => {
  const { contextMenu, setContextMenu } = useWindStore();

  if (!contextMenu) return null;

  return (
    <MarkerMenu
      poleId={contextMenu.poleId}
      position={{ x: contextMenu.x, y: contextMenu.y }}
      onClose={() => setContextMenu(null)}
    />
  );
};
