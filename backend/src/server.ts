/**
 * Express Server Setup
 * 
 * Main application entry point.
 * Configures Express, middleware, routes, and error handling.
 * 
 * Constitution: TypeScript Strict Mode + Mobile-Ready Architecture
 */

// Load environment variables FIRST (before any other imports)
import 'dotenv/config'

import express, { Application } from 'express'
import cors from 'cors'
import { env } from './config/env'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

// Initialize Express app
const app: Application = express()

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS - Allow frontend origin
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}))

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging in development
if (env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
  })
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  })
})

// ============================================================================
// API ROUTES
// ============================================================================

import authRoutes from './routes/auth.routes'
import goalsRoutes from './routes/goals.routes'

app.use('/api/auth', authRoutes)
app.use('/api/goals', goalsRoutes)
// app.use('/api/habits', habitsRoutes) // Phase 5 - User Story 3
// app.use('/api/categories', categoriesRoutes) // Phase 6 - User Story 4

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler (must be after all routes)
app.use(notFoundHandler)

// Global error handler (must be last)
app.use(errorHandler)

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = env.PORT || 3000

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📍 Environment: ${env.NODE_ENV}`)
    console.log(`✅ Phase 2 (Foundational) infrastructure ready`)
  })
}

export default app

