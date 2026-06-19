import express from "express";
import { samples, products } from "../data/mockData.js";
import type { Sample, SampleStatus } from "../../shared/types.js";

const router = express.Router();

const generateId = () => Math.random().toString(36).substring(2, 10);

const enrichSample = (s: Sample) => {
  const p = products.find((prod) => prod.id === s.productId);
  return { ...s, product: p };
};

const updateSampleStatus = (s: Sample): Sample => {
  if (s.status === "destroyed") return s;
  const now = new Date();
  const expire = new Date(s.expireTime);
  const hoursLeft = (expire.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursLeft <= 0) {
    s.status = "expired";
  } else if (hoursLeft <= 24) {
    s.status = "expiring";
  } else {
    s.status = "active";
  }
  return s;
};

router.get("/", (req, res) => {
  const { status, productId, keyword } = req.query;
  let result = samples.map(updateSampleStatus);

  if (status) {
    result = result.filter((s) => s.status === status);
  }
  if (productId) {
    result = result.filter((s) => s.productId === productId);
  }
  if (keyword) {
    const kw = String(keyword).toLowerCase();
    result = result.filter((s) => {
      const p = products.find((prod) => prod.id === s.productId);
      return (
        s.containerNo.toLowerCase().includes(kw) ||
        s.fridgeSlot.toLowerCase().includes(kw) ||
        (p && p.name.toLowerCase().includes(kw))
      );
    });
  }

  result.sort(
    (a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  const enriched = result.map(enrichSample);
  res.json({ success: true, data: enriched });
});

router.get("/:id", (req, res) => {
  const sample = samples.find((s) => s.id === req.params.id);
  if (!sample) {
    return res
      .status(404)
      .json({ success: false, error: "留样记录不存在" });
  }
  const enriched = enrichSample(updateSampleStatus(sample));
  res.json({ success: true, data: enriched });
});

router.post("/", (req, res) => {
  const body = req.body as Partial<Sample>;

  if (!body.productId || !body.weight || !body.containerNo || !body.fridgeSlot) {
    return res.status(400).json({
      success: false,
      error: "商品、重量、容器编号、冷藏格为必填项",
    });
  }

  const product = products.find((p) => p.id === body.productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, error: "关联商品不存在" });
  }

  const startTime = body.startTime || new Date().toISOString();
  const expireDate = new Date(startTime);
  expireDate.setHours(expireDate.getHours() + 48);

  const newSample: Sample = {
    id: generateId(),
    productId: body.productId,
    weight: body.weight,
    containerNo: body.containerNo,
    fridgeSlot: body.fridgeSlot,
    startTime,
    expireTime: body.expireTime || expireDate.toISOString(),
    status: "active",
  };

  samples.unshift(newSample);

  const pIdx = products.findIndex((p) => p.id === body.productId);
  if (pIdx !== -1) {
    products[pIdx].hasSample = true;
  }

  const enriched = enrichSample(newSample);
  res.status(201).json({ success: true, data: enriched });
});

router.put("/:id", (req, res) => {
  const idx = samples.findIndex((s) => s.id === req.params.id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, error: "留样记录不存在" });
  }

  const body = req.body as Partial<Sample>;
  samples[idx] = { ...samples[idx], ...body, id: samples[idx].id };
  const enriched = enrichSample(updateSampleStatus(samples[idx]));
  res.json({ success: true, data: enriched });
});

export default router;
