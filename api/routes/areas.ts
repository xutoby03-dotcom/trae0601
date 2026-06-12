import { Router, type Request, type Response } from "express";
import {
  getAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea,
} from "../services/dataStore.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const areas = getAreas();
  res.json({ success: true, data: areas });
});

router.get("/:id", (req: Request, res: Response) => {
  const area = getAreaById(req.params.id);
  if (!area) {
    res.status(404).json({ success: false, error: "区域不存在" });
    return;
  }
  res.json({ success: true, data: area });
});

router.post("/", (req: Request, res: Response) => {
  try {
    const { name, capacity, chargingCapacity, hasCharging, manager, photoUrl } = req.body;
    if (!name || capacity == null) {
      res.status(400).json({ success: false, error: "区域名和容量为必填项" });
      return;
    }
    const area = createArea({
      name,
      capacity: Number(capacity),
      chargingCapacity: Number(chargingCapacity) || 0,
      hasCharging: Boolean(hasCharging),
      manager: manager || "",
      photoUrl: photoUrl || "",
    });
    res.json({ success: true, data: area });
  } catch (err) {
    res.status(500).json({ success: false, error: "创建区域失败" });
  }
});

router.put("/:id", (req: Request, res: Response) => {
  try {
    const updated = updateArea(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: "区域不存在" });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: "更新区域失败" });
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  const ok = deleteArea(req.params.id);
  if (!ok) {
    res.status(404).json({ success: false, error: "区域不存在" });
    return;
  }
  res.json({ success: true });
});

export default router;
