import { Router } from 'express';
import { nanoid } from 'nanoid';
import { readChairs, writeChairs } from '../db.js';

const router = Router();

function validateChair(chair, requireAll = true) {
  const required = ['code', 'area', 'model', 'purchaseDate', 'gasRodBatch', 'armrestType'];
  for (const field of required) {
    if (requireAll && !chair[field]) {
      return { ok: false, msg: `缺少必填字段：${field}` };
    }
  }
  if (chair.code && !/^[A-Z]-\d{3}$/.test(chair.code) && !/^.+-\d+$/.test(chair.code)) {
    // 宽松一点的校验
  }
  return { ok: true };
}

router.get('/', (req, res) => {
  try {
    const chairs = readChairs();
    const { code, area, model, armrestType, disabled } = req.query;
    let result = chairs;
    if (code) result = result.filter((c) => c.code.toLowerCase().includes(String(code).toLowerCase()));
    if (area) result = result.filter((c) => c.area === area);
    if (model) result = result.filter((c) => c.model === model);
    if (armrestType) result = result.filter((c) => c.armrestType === armrestType);
    if (disabled !== undefined) result = result.filter((c) => c.disabled === (disabled === 'true'));
    res.json({ success: true, data: result, total: result.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const chairs = readChairs();
    const chair = chairs.find((c) => c.id === req.params.id);
    if (!chair) {
      return res.status(404).json({ success: false, message: '椅子不存在' });
    }
    res.json({ success: true, data: chair });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const body = req.body;
    const validation = validateChair(body, true);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.msg });
    }
    const chairs = readChairs();
    if (chairs.some((c) => c.code === body.code)) {
      return res.status(400).json({ success: false, message: '椅子编号已存在' });
    }
    const newChair = {
      id: `chair-${nanoid(8)}`,
      code: body.code,
      area: body.area,
      model: body.model,
      purchaseDate: body.purchaseDate,
      gasRodBatch: body.gasRodBatch,
      armrestType: body.armrestType,
      photo: body.photo || `https://picsum.photos/seed/${Date.now()}/400/300`,
      disabled: body.disabled || false,
    };
    chairs.push(newChair);
    writeChairs(chairs);
    res.status(201).json({ success: true, data: newChair });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const body = req.body;
    const validation = validateChair(body, false);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.msg });
    }
    const chairs = readChairs();
    const idx = chairs.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: '椅子不存在' });
    }
    if (body.code && chairs.some((c, i) => i !== idx && c.code === body.code)) {
      return res.status(400).json({ success: false, message: '椅子编号已被占用' });
    }
    chairs[idx] = { ...chairs[idx], ...body, id: chairs[idx].id };
    writeChairs(chairs);
    res.json({ success: true, data: chairs[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/disable', (req, res) => {
  try {
    const { disabled } = req.body;
    const chairs = readChairs();
    const idx = chairs.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: '椅子不存在' });
    }
    chairs[idx].disabled = !!disabled;
    writeChairs(chairs);
    res.json({ success: true, data: chairs[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const chairs = readChairs();
    const idx = chairs.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: '椅子不存在' });
    }
    const removed = chairs.splice(idx, 1);
    writeChairs(chairs);
    res.json({ success: true, data: removed[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
