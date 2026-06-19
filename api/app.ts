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
import gardenBedsRoutes from './routes/gardenBeds.js'
import schedulesRoutes from './routes/schedules.js'
import checkInsRoutes from './routes/checkIns.js'
import anomaliesRoutes from './routes/anomalies.js'
import volunteersRoutes from './routes/volunteers.js'
import statsRoutes from './routes/stats.js'
import weatherRoutes from './routes/weather.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/garden-beds', gardenBedsRoutes)
app.use('/api/schedules', schedulesRoutes)
app.use('/api/check-ins', checkInsRoutes)
app.use('/api/anomalies', anomaliesRoutes)
app.use('/api/volunteers', volunteersRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/weather', weatherRoutes)

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
