import { Router } from "express";
import * as products from "../controllers/products.js";

const router = Router();

router.get("/", products.getProducts);
router.get("/:id", products.getProduct);
router.put("/:id", products.updateProduct);
router.put("/:id/stock", products.updateStock);

export default router;
