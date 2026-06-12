import { Router, type Request, type Response } from "express";
import {
  getDisposals,
  createDisposal,
  getPendingDisposals,
  getAreas,
  getVehicles,
} from "../services/dataStore.js";
import type { DisposalWithDetails } from "../../shared/types.js";

const router = Router();

function enrichDisposal(d: ReturnType<typeof getDisposals>[0]): DisposalWithDetails {
  const areas = getAreas();
  const vehicles = getVehicles();
  const area = areas.find((a) => a.id === d.areaId);
  const vehicle = vehicles.find((v) => v.id === d.vehicleId);
  const daysUnmoved = vehicle
    ? Math.floor(
        (new Date(d.disposalTime).getTime() - new Date(vehicle.lastMovedAt).getTime()) /
          (24 * 60 * 60 * 1000),
      )
    : 0;
  return {
    ...d,
    plateNumber: vehicle?.plateNumber || "未知车辆",
    areaName: area?.name || "未知区域",
    vehiclePhotoUrl: vehicle?.photoUrl || "",
    ownerPhone: vehicle?.ownerPhone || "",
    daysUnmoved,
  };
}

router.get("/", (req: Request, res: Response) => {
  const { scope } = req.query;
  if (scope === "pending") {
    const pending = getPendingDisposals();
    const areas = getAreas();
    const now = new Date();
    const enriched = pending.map((v) => {
      const area = areas.find((a) => a.id === v.areaId);
      const daysUnmoved = Math.floor(
        (now.getTime() - new Date(v.lastMovedAt).getTime()) / (24 * 60 * 60 * 1000),
      );
      return {
        ...v,
        areaName: area?.name || "未知区域",
        daysUnmoved,
      };
    });
    res.json({ success: true, data: enriched });
    return;
  }
  const disposals = getDisposals();
  const enriched = disposals.map(enrichDisposal);
  res.json({ success: true, data: enriched });
});

router.post("/", (req: Request, res: Response) => {
  try {
    const { vehicleId, areaId, disposalType, disposalTime, photoUrl, remark, handledBy } = req.body;
    if (!vehicleId || !areaId || !disposalType) {
      res.status(400).json({ success: false, error: "车辆、区域和处理方式为必填项" });
      return;
    }
    const disposal = createDisposal({
      vehicleId,
      areaId,
      disposalType,
      disposalTime: disposalTime || new Date().toISOString(),
      photoUrl: photoUrl || "",
      remark: remark || "",
      handledBy: handledBy || "系统管理员",
    });
    res.json({ success: true, data: enrichDisposal(disposal) });
  } catch (err) {
    res.status(500).json({ success: false, error: "创建处理记录失败" });
  }
});

export default router;
