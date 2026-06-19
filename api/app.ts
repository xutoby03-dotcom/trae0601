/**
 * 卤味留样管理系统 API Server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import fs from "fs";

import dashboardRoutes from "./routes/dashboard.js";
import productsRoutes from "./routes/products.js";
import samplesRoutes from "./routes/samples.js";
import incidentsRoutes from "./routes/incidents.js";
import destructionRoutes from "./routes/destruction.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const uploadsDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

app.post("/api/upload", (req: Request, res: Response) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res
        .status(400)
        .json({ success: false, error: "未提供图片数据" });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = Buffer.from(base64Data, "base64");
    const finalFilename =
      filename || `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const filePath = path.join(uploadsDir, finalFilename);

    fs.writeFileSync(filePath, dataBuffer);
    res.json({
      success: true,
      data: { url: `/uploads/${finalFilename}` },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: "上传失败" });
  }
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/samples", samplesRoutes);
app.use("/api/incidents", incidentsRoutes);
app.use("/api/destruction", destructionRoutes);

app.use(
  "/api/health",
  (req: Request, res: Response, _next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: "卤味留样管理系统 API 运行正常",
    });
  },
);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({
    success: false,
    error: "服务器内部错误",
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "API 路由不存在",
  });
});

export default app;
