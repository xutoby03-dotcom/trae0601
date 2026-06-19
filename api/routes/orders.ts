import { Router } from "express";
import * as orders from "../controllers/orders.js";

const router = Router();

router.get("/", orders.getOrders);
router.get("/:id", orders.getOrder);
router.post("/", orders.createOrder);
router.put("/:id", orders.updateOrder);
router.patch("/:id/payment", orders.updatePaymentStatus);
router.patch("/:id/status", orders.updateOrderStatus);
router.delete("/:id", orders.deleteOrder);

export default router;
