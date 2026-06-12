import { Router, type Request, type Response } from "express";
import {
  getPatrols,
  createPatrol,
  getAreas,
  getVehicles,
} from "../services/dataStore.js";
import type { PatrolWithDetails } from "../../shared/types.js";

const router = Router();

function enrichPatrol(p: ReturnType<typeof getPatrols>[0]): PatrolWithDetails {
  const areas = getAreas();
  const vehicles = getVehicles();
  const area = areas.find((a) => a.id === p.areaId);
  const vehicle = vehicles.find((v) => v.id === p.vehicleId);
  return {
    ...p,
    plateNumber: vehicle?.plateNumber || "未知车辆",
    areaName: area?.name || "未知区域",
    vehiclePhotoUrl: vehicle?.photoUrl || "",
  };
}

router.get("/", (req: Request, res: Response) => {
  const { areaId, status } = req.query;
  let patrols = getPatrols();
  if (areaId) patrols = patrols.filter((p) => p.areaId === areaId);
  if (status) patrols = patrols.filter((p) => p.status === status);
  const enriched = patrols.map(enrichPatrol);
  res.json({ success: true, data: enriched });
});

router.post("/", (req: Request, res: Response) => {
  try {
    const { vehicleId, areaId, status, remark, photoUrl, patrolUser, patrolTime } = req.body;
    if (!vehicleId || !areaId || !status) {
      res.status(400).json({ success: false, error: "车辆、区域和状态为必填项" });
      return;
    }
    const patrol = createPatrol({
      vehicleId,
      areaId,
      status,
      remark: remark || "",
      photoUrl: photoUrl || "",
      patrolTime: patrolTime || new Date().toISOString(),
      patrolUser: patrolUser || "系统管理员",
    });
    res.json({ success: true, data: enrichPatrol(patrol) });
  } catch (err) {
    res.status(500).json({ success: false, error: "创建巡查记录失败" });
  }
});

export default router;
