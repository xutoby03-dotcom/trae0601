import { Router } from 'express';
import { nanoid } from 'nanoid';
import { readOrders, writeOrders, readChairs } from '../db.js';

const router = Router();
const VALID_STATUS = ['pending', 'repairing', 'done', 'closed'];
const VALID_FAULTS = ['noise', 'sinking', 'backrest_loose', 'wheel_jammed', 'armrest_broken', 'seat_collapse'];
const VALID_FREQ = ['rare', 'occasional', 'frequent', 'always'];

function validateOrderCreate(body) {
  if (!body.chairId) return { ok: false, msg: '缺少 chairId' };
  const chairs = readChairs();
  if (!chairs.some((c) => c.id === body.chairId)) return { ok: false, msg: '椅子不存在' };
  if (!body.reporter) return { ok: false, msg: '缺少上报人' };
  if (!body.faultTypes || !Array.isArray(body.faultTypes) || body.faultTypes.length === 0) {
    return { ok: false, msg: '至少选择一种故障类型' };
  }
  for (const f of body.faultTypes) {
    if (!VALID_FAULTS.includes(f)) return { ok: false, msg: `无效故障类型: ${f}` };
  }
  if (!body.frequency || !VALID_FREQ.includes(body.frequency)) {
    return { ok: false, msg: '缺少或无效的发生频率' };
  }
  return { ok: true };
}

router.get('/', (req, res) => {
  try {
    const orders = readOrders();
    const { status, faultType, chairId, reporter, assignee } = req.query;
    let result = orders;
    if (status) result = result.filter((o) => o.status === status);
    if (faultType) result = result.filter((o) => o.faultTypes.includes(String(faultType)));
    if (chairId) result = result.filter((o) => o.chairId === chairId);
    if (reporter) result = result.filter((o) => o.reporter.includes(String(reporter)));
    if (assignee) result = result.filter((o) => o.assignee === assignee);
    result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({ success: true, data: result, total: result.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const orders = readOrders();
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) return res.status(404).json({ success: false, message: '工单不存在' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const body = req.body;
    const validation = validateOrderCreate(body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.msg });
    }
    const orders = readOrders();
    const newOrder = {
      id: `order-${nanoid(8)}`,
      chairId: body.chairId,
      reporter: body.reporter,
      faultTypes: body.faultTypes,
      frequency: body.frequency,
      description: body.description || '',
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      assignee: body.assignee || undefined,
      needDisable: !!body.needDisable,
    };
    orders.unshift(newOrder);
    writeOrders(orders);
    res.status(201).json({ success: true, data: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const body = req.body;
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: '工单不存在' });
    if (body.status && !VALID_STATUS.includes(body.status)) {
      return res.status(400).json({ success: false, message: '无效状态值' });
    }
    if (body.faultTypes) {
      for (const f of body.faultTypes) {
        if (!VALID_FAULTS.includes(f)) return res.status(400).json({ success: false, message: `无效故障类型: ${f}` });
      }
    }
    if (body.frequency && !VALID_FREQ.includes(body.frequency)) {
      return res.status(400).json({ success: false, message: '无效频率值' });
    }
    orders[idx] = { ...orders[idx], ...body, id: orders[idx].id };
    writeOrders(orders);
    res.json({ success: true, data: orders[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/assign', (req, res) => {
  try {
    const { assignee } = req.body;
    if (!assignee) return res.status(400).json({ success: false, message: '缺少处理人' });
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: '工单不存在' });
    orders[idx].assignee = assignee;
    if (orders[idx].status === 'pending') orders[idx].status = 'repairing';
    writeOrders(orders);
    res.json({ success: true, data: orders[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUS.includes(status)) {
      return res.status(400).json({ success: false, message: '缺少或无效的状态' });
    }
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: '工单不存在' });
    orders[idx].status = status;
    writeOrders(orders);
    res.json({ success: true, data: orders[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: '工单不存在' });
    const removed = orders.splice(idx, 1);
    writeOrders(orders);
    res.json({ success: true, data: removed[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
