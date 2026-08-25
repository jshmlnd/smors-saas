import http from 'node:http'
import app from './app.js'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'

const server = http.createServer(app)

async function bootstrap() {
  await connectDB()
  server.listen(env.PORT, () => {
    console.log(`[SMORS] API listening on http://localhost:${env.PORT}`)
  })
}

bootstrap().catch((err) => {
  console.error('[SMORS] Fatal startup error:', err.message)
  process.exit(1)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`[SMORS] ${signal} received — shutting down`)
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(1), 5000).unref()
  })
}
