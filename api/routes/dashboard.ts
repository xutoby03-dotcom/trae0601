import { Router, type Request, type Response } from "express";
import { getDashboardData } from "../services/dataStore.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const data = getDashboardData();
  res.json({ success: true, data });
});

export default router;
