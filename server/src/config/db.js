import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB() {
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    console.log('[SMORS] MongoDB connected')
    return true
  } catch (err) {
    if (env.EXIT_ON_DB_FAIL) throw err
    console.warn(`[SMORS] MongoDB unavailable (${err.message}) — running degraded`)
    return false
  }
}

export const dbReady = () => mongoose.connection.readyState === 1
