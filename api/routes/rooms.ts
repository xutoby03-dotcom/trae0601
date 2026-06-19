import { Router } from 'express';
import { store } from '../store';
import type { FittingRoom } from '../../shared/types';

const router = Router();

router.get('/', (req, res) => {
  const rooms = store.getRooms();
  res.json(rooms);
});

router.post('/', (req, res) => {
  const roomData = req.body as Omit<FittingRoom, 'id'>;
  
  if (!roomData.number || roomData.floor === undefined) {
    return res.status(400).json({ error: '试衣间编号和楼层不能为空' });
  }

  const newRoom = store.addRoom({
    number: roomData.number,
    floor: roomData.floor,
    hasMirrorLight: roomData.hasMirrorLight ?? false,
    cleanStatus: roomData.cleanStatus ?? 'clean',
    maxItems: roomData.maxItems ?? 5,
    status: roomData.status ?? 'available',
    photoUrl: roomData.photoUrl,
  });

  res.status(201).json(newRoom);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const data = req.body as Partial<FittingRoom>;
  
  const updated = store.updateRoom(id, data);
  if (!updated) {
    return res.status(404).json({ error: '试衣间不存在' });
  }
  
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const success = store.deleteRoom(id);
  
  if (!success) {
    return res.status(404).json({ error: '试衣间不存在' });
  }
  
  res.json({ success: true });
});

export default router;
