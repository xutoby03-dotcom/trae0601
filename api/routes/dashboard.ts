import express from "express";
import { products, samples, incidents } from "../data/mockData.js";
import type { DashboardStats, ProductCategory } from "../../shared/types.js";

const router = express.Router();

router.get("/", (req, res) => {
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayProducts = products.filter(
    (p) => new Date(p.createdAt) >= todayStart
  );

  const todaySamplesDone = samples.filter(
    (s) =>
      new Date(s.startTime) >= todayStart &&
      s.status !== "destroyed"
  ).length;

  const pendingDestruction = samples.filter(
    (s) =>
      s.status === "expiring" || s.status === "expired"
  ).length;

  const activeIncidents = incidents.filter(
    (i) => i.status === "pending" || i.status === "investigating"
  ).length;

  const fridgeCapacity = 20;
  const fridgeOccupancy = samples.filter(
    (s) => s.status !== "destroyed"
  ).length;

  const categoryList: ProductCategory[] = [
    "chicken_feet",
    "duck_neck",
    "tofu",
    "other",
  ];

  const categoryNames: Record<ProductCategory, string> = {
    chicken_feet: "卤鸡爪",
    duck_neck: "卤鸭脖",
    tofu: "卤豆干",
    other: "其他卤味",
  };

  const categoryCompletion = categoryList.map((cat) => {
    const required = todayProducts.filter((p) => p.category === cat).length || 1;
    const done = todayProducts.filter(
      (p) => p.category === cat && p.hasSample
    ).length;
    return {
      category: cat,
      name: categoryNames[cat],
      required,
      done,
      completionRate: Math.round((done / required) * 100),
    };
  });

  const stats: DashboardStats = {
    todaySamplesRequired: todayProducts.length,
    todaySamplesDone,
    pendingDestruction,
    activeIncidents,
    fridgeOccupancy,
    fridgeCapacity,
    categoryCompletion,
  };

  res.json({ success: true, data: stats });
});

router.get("/expiring-samples", (req, res) => {
  const expiring = samples
    .filter((s) => s.status === "expiring" || s.status === "expired")
    .sort(
      (a, b) => new Date(a.expireTime).getTime() - new Date(b.expireTime).getTime()
    )
    .slice(0, 5);

  res.json({ success: true, data: expiring });
});

router.get("/recent-incidents", (req, res) => {
  const recent = [...incidents]
    .sort(
      (a, b) =>
        new Date(b.occurTime).getTime() - new Date(a.occurTime).getTime()
    )
    .slice(0, 5);

  res.json({ success: true, data: recent });
});

export default router;
