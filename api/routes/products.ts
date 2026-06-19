import express from "express";
import { products, samples } from "../data/mockData.js";
import type { Product } from "../../shared/types.js";

const router = express.Router();

const generateId = () => Math.random().toString(36).substring(2, 10);

router.get("/", (req, res) => {
  const { category, isOnSale, keyword } = req.query;
  let result = [...products];

  if (category) {
    result = result.filter((p) => p.category === category);
  }
  if (isOnSale !== undefined) {
    result = result.filter((p) => p.isOnSale === (isOnSale === "true"));
  }
  if (keyword) {
    const kw = String(keyword).toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        p.formulaBatch.toLowerCase().includes(kw) ||
        p.processor.toLowerCase().includes(kw)
    );
  }

  result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json({ success: true, data: result });
});

router.get("/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, error: "商品档案不存在" });
  }
  const relatedSamples = samples.filter((s) => s.productId === product.id);
  res.json({ success: true, data: { ...product, samples: relatedSamples } });
});

router.post("/", (req, res) => {
  const body = req.body as Partial<Product>;

  if (!body.name || !body.category || !body.processor) {
    return res.status(400).json({
      success: false,
      error: "品名、品类、加工人为必填项",
    });
  }

  const newProduct: Product = {
    id: generateId(),
    name: body.name,
    category: body.category,
    formulaBatch: body.formulaBatch || `PF-${Date.now()}`,
    processor: body.processor,
    cookTime: body.cookTime || new Date().toISOString(),
    salesWindow: body.salesWindow || "",
    photoUrl: body.photoUrl || "",
    isOnSale: body.hasSample ? body.isOnSale ?? false : false,
    hasSample: false,
    createdAt: new Date().toISOString(),
  };

  products.unshift(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

router.put("/:id", (req, res) => {
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, error: "商品档案不存在" });
  }

  const body = req.body as Partial<Product>;

  if (body.isOnSale && !products[idx].hasSample) {
    return res.status(400).json({
      success: false,
      error: "未完成留样的批次不能上架",
    });
  }

  products[idx] = { ...products[idx], ...body, id: products[idx].id };
  res.json({ success: true, data: products[idx] });
});

router.delete("/:id", (req, res) => {
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, error: "商品档案不存在" });
  }
  products.splice(idx, 1);
  res.json({ success: true });
});

export default router;
