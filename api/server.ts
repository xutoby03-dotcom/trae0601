import express from "express";
import cors from "cors";
import { initDatabase } from "./db/index.js";
import studentsRouter from "./routes/students.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import purchasesRouter from "./routes/purchases.js";

const app = express();
const PORT = process.env.PORT || 3001;

initDatabase();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

app.use("/api/students", studentsRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/purchases", purchasesRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log("\n🚀 Server running at:");
  console.log(`   - Local:    http://localhost:${PORT}`);
  console.log(`   - API:      http://localhost:${PORT}/api`);
  console.log(`   - Health:   http://localhost:${PORT}/api/health\n`);
});
