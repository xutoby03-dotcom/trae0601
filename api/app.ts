import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import seatsRoutes from './routes/seats.js'
import disputesRoutes from './routes/disputes.js'
import statsRoutes from './routes/stats.js'
import adminRoutes from './routes/admin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '16mb' }))
app.use(express.urlencoded({ extended: true, limit: '16mb' }))

app.use('/api/seats', seatsRoutes)
app.use('/api/disputes', disputesRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/admin', adminRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error & { status?: number; type?: string }, req: Request, res: Response, next: NextFunction) => {
  if (error.status === 413 || error.type === 'entity.too.large') {
    res.status(413).json({
      success: false,
      error: '提交内容过大，请压缩图片后重试（建议小于 5MB）',
    })
    return
  }
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
