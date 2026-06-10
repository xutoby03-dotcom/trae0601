/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import exhibitionRoutes from './routes/exhibitions.js'
import boothRoutes from './routes/booths.js'
import applicationRoutes from './routes/applications.js'
import setupRoutes from './routes/setup.js'
import statsRoutes from './routes/stats.js'
import { initDB } from './lib/db.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

// init database
initDB()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * API Routes —— 路径更长、更具体的要先注册，避免 `/:id` 提前匹配
 */
app.use('/api', boothRoutes)
app.use('/api', applicationRoutes)
app.use('/api', setupRoutes)
app.use('/api', statsRoutes)
app.use('/api/exhibitions', exhibitionRoutes)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
