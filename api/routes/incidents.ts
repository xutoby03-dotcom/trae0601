import express from "express";
import { incidents, samples, products } from "../data/mockData.js";
import type { Incident, IncidentType } from "../../shared/types.js";

const router = express.Router();

const generateId = () => Math.random().toString(36).substring(2, 10);

const SAMPLE_REQUIRED_TYPES: IncidentType[] = [
  "complaint",
  "odor",
  "temperature",
];

const isSameDay = (date1: string, date2: string) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

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

const validateSampleRelation = (
  type: IncidentType,
  sampleId: string | undefined,
  occurTime: string
): { valid: boolean; error?: string } => {
  if (SAMPLE_REQUIRED_TYPES.includes(type) && !sampleId) {
    return {
      valid: false,
      error: "售卖投诉、异味、温度异常必须关联对应的留样记录",
    };
  }

  if (sampleId) {
    const sample = samples.find((s) => s.id === sampleId);
    if (!sample) {
      return { valid: false, error: "关联的留样记录不存在" };
    }
    if (sample.status === "destroyed") {
      return { valid: false, error: "无法关联已销毁的留样记录" };
    }
    if (!isSameDay(sample.startTime, occurTime)) {
      return {
        valid: false,
        error: "只能关联与发生时间同一天的留样记录",
      };
    }
  }

  return { valid: true };
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

  const occurTime = body.occurTime || new Date().toISOString();

  const validation = validateSampleRelation(
    body.type,
    body.sampleId,
    occurTime
  );
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  const newIncident: Incident = {
    id: generateId(),
    type: body.type,
    description: body.description,
    sampleId: body.sampleId,
    occurTime,
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
  const updated = { ...incidents[idx], ...body, id: incidents[idx].id };

  const occurTime = updated.occurTime;
  const validation = validateSampleRelation(
    updated.type,
    updated.sampleId,
    occurTime
  );
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  incidents[idx] = updated;
  res.json({ success: true, data: enrichIncident(incidents[idx]) });
});

export default router;
