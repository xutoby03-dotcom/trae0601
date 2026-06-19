import express from "express";
import { samples, products } from "../data/mockData.js";
import type { Sample } from "../../shared/types.js";

const router = express.Router();

const enrichSample = (s: Sample) => {
  const p = products.find((prod) => prod.id === s.productId);
  return { ...s, product: p };
};

const updateStatus = (s: Sample): Sample => {
  if (s.status === "destroyed") return s;
  const now = new Date();
  const expire = new Date(s.expireTime);
  const hoursLeft = (expire.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursLeft <= 0) s.status = "expired";
  else if (hoursLeft <= 24) s.status = "expiring";
  else s.status = "active";
  return s;
};

router.get("/pending", (req, res) => {
  const pending = samples
    .map(updateStatus)
    .filter((s) => s.status === "expiring" || s.status === "expired")
    .sort(
      (a, b) =>
        new Date(a.expireTime).getTime() - new Date(b.expireTime).getTime()
    )
    .map(enrichSample);

  res.json({ success: true, data: pending });
});

router.post("/:sampleId/confirm", (req, res) => {
  const idx = samples.findIndex((s) => s.id === req.params.sampleId);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, error: "留样记录不存在" });
  }

  const { destructionPhoto, destructionPerson } = req.body;

  if (!destructionPhoto || !destructionPerson) {
    return res
      .status(400)
      .json({ success: false, error: "销毁照片和销毁人为必填项" });
  }

  samples[idx].status = "destroyed";
  samples[idx].destructionPhoto = destructionPhoto;
  samples[idx].destructionPerson = destructionPerson;
  samples[idx].destructionTime = new Date().toISOString();

  res.json({ success: true, data: enrichSample(samples[idx]) });
});

export default router;
