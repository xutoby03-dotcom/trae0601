import { Router, type Request, type Response } from "express";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAreas,
} from "../services/dataStore.js";
import type { VehicleWithArea } from "../../shared/types.js";

const router = Router();

function enrichVehicle(v: ReturnType<typeof getVehicles>[0]): VehicleWithArea {
  const areas = getAreas();
  const area = areas.find((a) => a.id === v.areaId);
  return {
    ...v,
    areaName: area?.name || "未知区域",
  };
}

router.get("/", (req: Request, res: Response) => {
  const { areaId, status } = req.query;
  let vehicles = getVehicles();
  if (areaId) vehicles = vehicles.filter((v) => v.areaId === areaId);
  if (status) vehicles = vehicles.filter((v) => v.status === status);
  const enriched = vehicles.map(enrichVehicle);
  res.json({ success: true, data: enriched });
});

router.get("/:id", (req: Request, res: Response) => {
  const vehicle = getVehicleById(req.params.id);
  if (!vehicle) {
    res.status(404).json({ success: false, error: "车辆不存在" });
    return;
  }
  res.json({ success: true, data: enrichVehicle(vehicle) });
});

router.post("/", (req: Request, res: Response) => {
  try {
    const { plateNumber, vehicleType, ownerPhone, areaId, photoUrl, status, lastMovedAt } = req.body;
    if (!plateNumber || !areaId) {
      res.status(400).json({ success: false, error: "车牌编号和停放区域为必填项" });
      return;
    }
    const vehicle = createVehicle({
      plateNumber,
      vehicleType: vehicleType || "电动车",
      ownerPhone: ownerPhone || "",
      areaId,
      photoUrl: photoUrl || "",
      status: status || "normal",
      lastMovedAt: lastMovedAt || new Date().toISOString(),
    });
    res.json({ success: true, data: enrichVehicle(vehicle) });
  } catch (err) {
    res.status(500).json({ success: false, error: "创建车辆失败" });
  }
});

router.put("/:id", (req: Request, res: Response) => {
  try {
    const updated = updateVehicle(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: "车辆不存在" });
      return;
    }
    res.json({ success: true, data: enrichVehicle(updated) });
  } catch (err) {
    res.status(500).json({ success: false, error: "更新车辆失败" });
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  const ok = deleteVehicle(req.params.id);
  if (!ok) {
    res.status(404).json({ success: false, error: "车辆不存在" });
    return;
  }
  res.json({ success: true });
});

export default router;
