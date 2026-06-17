import { Router } from 'express';
import { nanoid } from 'nanoid';
import { readOrders, writeOrders, readChairs, writeChairs } from '../db.js';

const router = Router();

function validateRepair(body) {
  if (!body.orderId) return { ok: false, msg: '缺少 orderId' };
  if (!body.startedAt) return { ok: false, msg: '缺少开始时间' };
  if (!body.finishedAt) return { ok: false, msg: '缺少完成时间' };
  if (!body.handler) return { ok: false, msg: '缺少处理人' };
  if (body.partsReplaced) {
    if (!Array.isArray(body.partsReplaced)) return { ok: false, msg: 'partsReplaced 必须是数组' };
    for (const p of body.partsReplaced) {
      if (p.name && (typeof p.quantity !== 'number' || typeof p.unitCost !== 'number')) {
        return { ok: false, msg: '部件必须包含数量和单价' };
      }
    }
  }
  return { ok: true };
}

router.get('/', (req, res) => {
  try {
    const orders = readOrders();
    const repairs = [];
    orders.forEach((order) => {
      if (order.repair) repairs.push({ record: order.repair, order });
    });
    const { handler, needDisable, chairId, orderId } = req.query;
    let result = repairs;
    if (handler) result = result.filter((r) => r.record.handler === handler);
    if (needDisable !== undefined) result = result.filter((r) => r.record.needDisable === (needDisable === 'true'));
    if (chairId) result = result.filter((r) => r.order.chairId === chairId);
    if (orderId) result = result.filter((r) => r.order.id === orderId);
    result = [...result].sort((a, b) => b.record.finishedAt.localeCompare(a.record.finishedAt));
    res.json({ success: true, data: result, total: result.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const orders = readOrders();
    let found = null;
    for (const order of orders) {
      if (order.repair && order.repair.id === req.params.id) {
        found = { record: order.repair, order };
        break;
      }
    }
    if (!found) return res.status(404).json({ success: false, message: '维修记录不存在' });
    res.json({ success: true, data: found });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const body = req.body;
    const validation = validateRepair(body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.msg });
    }
    const orders = readOrders();
    const orderIdx = orders.findIndex((o) => o.id === body.orderId);
    if (orderIdx === -1) {
      return res.status(404).json({ success: false, message: '工单不存在' });
    }
    const parts = (body.partsReplaced || []).filter((p) => p.name);
    const partsCost = parts.reduce((s, p) => s + (p.unitCost || 0) * (p.quantity || 0), 0);
    const laborCost = body.laborCost || 0;
    const totalCost = body.totalCost ?? partsCost + laborCost;

    const repairId = `repair-${nanoid(8)}`;
    const repair = {
      id: repairId,
      orderId: body.orderId,
      startedAt: body.startedAt,
      finishedAt: body.finishedAt,
      partsReplaced: parts,
      laborCost,
      totalCost,
      handler: body.handler,
      needDisable: !!body.needDisable,
      beforePhoto: body.beforePhoto || `https://picsum.photos/seed/${repairId}-b/400/300`,
      afterPhoto: body.afterPhoto || `https://picsum.photos/seed/${repairId}-a/400/300`,
      notes: body.notes || '',
    };
    orders[orderIdx].repair = repair;
    orders[orderIdx].status = 'done';
    if (body.needDisable) {
      const chairs = readChairs();
      const chairIdx = chairs.findIndex((c) => c.id === orders[orderIdx].chairId);
      if (chairIdx !== -1) {
        chairs[chairIdx].disabled = true;
        writeChairs(chairs);
      }
    }
    writeOrders(orders);
    res.status(201).json({ success: true, data: { record: repair, order: orders[orderIdx] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const body = req.body;
    const orders = readOrders();
    let orderIdx = -1;
    let repairIdx = -1;
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].repair && orders[i].repair.id === req.params.id) {
        orderIdx = i;
        break;
      }
    }
    if (orderIdx === -1) {
      return res.status(404).json({ success: false, message: '维修记录不存在' });
    }
    const oldRepair = orders[orderIdx].repair;
    const parts = body.partsReplaced !== undefined
      ? body.partsReplaced.filter((p) => p.name)
      : oldRepair.partsReplaced;
    const partsCost = parts.reduce((s, p) => s + (p.unitCost || 0) * (p.quantity || 0), 0);
    const laborCost = body.laborCost !== undefined ? body.laborCost : oldRepair.laborCost;
    const totalCost = body.totalCost !== undefined ? body.totalCost : (partsCost + laborCost);

    orders[orderIdx].repair = {
      ...oldRepair,
      ...body,
      id: oldRepair.id,
      orderId: oldRepair.orderId,
      partsReplaced: parts,
      laborCost,
      totalCost,
    };
    if (body.needDisable !== undefined && body.needDisable !== oldRepair.needDisable) {
      const chairs = readChairs();
      const chairIdx = chairs.findIndex((c) => c.id === orders[orderIdx].chairId);
      if (chairIdx !== -1) {
        chairs[chairIdx].disabled = !!body.needDisable;
        writeChairs(chairs);
      }
    }
    writeOrders(orders);
    res.json({ success: true, data: { record: orders[orderIdx].repair, order: orders[orderIdx] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const orders = readOrders();
    let orderIdx = -1;
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].repair && orders[i].repair.id === req.params.id) {
        orderIdx = i;
        break;
      }
    }
    if (orderIdx === -1) {
      return res.status(404).json({ success: false, message: '维修记录不存在' });
    }
    const removed = orders[orderIdx].repair;
    delete orders[orderIdx].repair;
    orders[orderIdx].status = 'repairing';
    writeOrders(orders);
    res.json({ success: true, data: removed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
