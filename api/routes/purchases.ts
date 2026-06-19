import { Router } from "express";
import * as purchases from "../controllers/purchases.js";

const router = Router();

router.get("/", purchases.getPurchases);
router.get("/:id", purchases.getPurchase);
router.post("/", purchases.createPurchase);
router.put("/:id", purchases.updatePurchase);
router.post("/:id/complete", purchases.completePurchase);
router.delete("/:id", purchases.deletePurchase);

export default router;
