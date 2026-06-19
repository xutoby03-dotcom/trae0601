import express from "express";
import { incidents, samples, products } from "../data/mockData.js";
import type { Incident } from "../../shared/types.js";

const router = express.Router();

const generateId = () => Math.random().toString(36).substring(2, 10);

const enrichIncident = (inc: Incident) => {
  if (inc.sampleId) {
    const s = samples.find((sa) => sa.id === inc.sampleId);
    if (s) {
      const p = products.find((prod) => prod.id === s.productId);
      return { ...inc, sample: { ...s, product: p } };
    }
  }
  return inc;
};

router.get("/", (req, res) => {
  const { type, status } = req.query;
  let result = [...incidents];

  if (type) {
    result = result.filter((i) => i.type === type);
  }
  if (status) {
    result = result.filter((i) => i.status === status);
  }

  result.sort(
    (a, b) =>
      new Date(b.occurTime).getTime() - new Date(a.occurTime).getTime()
  );

  const enriched = result.map(enrichIncident);
  res.json({ success: true, data: enriched });
});

router.get("/:id", (req, res) => {
  const incident = incidents.find((i) => i.id === req.params.id);
  if (!incident) {
    return res
      .status(404)
      .json({ success: false, error: "异常事件不存在" });
  }
  res.json({ success: true, data: enrichIncident(incident) });
});

router.post("/", (req, res) => {
  const body = req.body as Partial<Incident>;

  if (!body.type || !body.description || !body.reporter) {
    return res
      .status(400)
      .json({ success: false, error: "事件类型、描述、上报人为必填项" });
  }

  const newIncident: Incident = {
    id: generateId(),
    type: body.type,
    description: body.description,
    sampleId: body.sampleId,
    occurTime: body.occurTime || new Date().toISOString(),
    reporter: body.reporter,
    status: body.status || "pending",
  };

  incidents.unshift(newIncident);
  res.status(201).json({ success: true, data: enrichIncident(newIncident) });
});

router.put("/:id", (req, res) => {
  const idx = incidents.findIndex((i) => i.id === req.params.id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, error: "异常事件不存在" });
  }

  const body = req.body as Partial<Incident>;
  incidents[idx] = { ...incidents[idx], ...body, id: incidents[idx].id };
  res.json({ success: true, data: enrichIncident(incidents[idx]) });
});

export default router;
