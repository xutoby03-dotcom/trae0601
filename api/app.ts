import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { initDatabase } from './data/database.js'
import { checkAllPrintersStock } from './services/alertService.js'

import printerRoutes from './routes/printers.js'
import consumptionRoutes from './routes/consumptions.js'
import replenishmentRoutes from './routes/replenishments.js'
import alertRoutes from './routes/alerts.js'
import statisticsRoutes from './routes/statistics.js'
import uploadRoutes from './routes/upload.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

initDatabase()

setInterval(() => {
  try {
    checkAllPrintersStock()
  } catch (err) {
    console.error('Stock check error:', err)
  }
}, 60 * 60 * 1000)

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use('/api/printers', printerRoutes)
app.use('/api/consumptions', consumptionRoutes)
app.use('/api/replenishments', replenishmentRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api/upload', uploadRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error)
  res.status(500).json({
    success: false,
    error: error.message || 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
