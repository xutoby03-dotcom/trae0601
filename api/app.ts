/**
 * 社区棋牌室预约系统 API 服务器
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
import fs from 'fs'

import tableRoutes from './routes/tables.js'
import reservationRoutes from './routes/reservations.js'
import statsRoutes from './routes/stats.js'
import { processAutoRelease, completeExpiredReservations } from './services/reservationService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/tables', tableRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/stats', statsRoutes)

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
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', error)
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
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

/**
 * 自动释放定时器 - 每分钟检查一次
 */
setInterval(() => {
  try {
    const released = processAutoRelease()
    if (released > 0) {
      console.log(`[自动释放] 释放了 ${released} 个超时未签到的预约`)
    }
    const completed = completeExpiredReservations()
    if (completed > 0) {
      console.log(`[自动完成] 标记了 ${completed} 个已结束的预约为已完成`)
    }
  } catch (err) {
    console.error('[定时任务] 执行出错:', err)
  }
}, 60 * 1000)

console.log('[系统] 自动释放定时器已启动 (每分钟检查一次)')

export default app
