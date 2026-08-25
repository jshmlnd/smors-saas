import dotenv from 'dotenv'

dotenv.config()

const parseList = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : [])

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://<db_user>:<db_password>@smors-data-collection.osjmn9a.mongodb.net/smors',
  JWT_SECRET: process.env.JWT_SECRET || 'smors-dev-secret-change-me',
  CLIENT_ORIGINS: parseList(process.env.CLIENT_ORIGINS),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'admin@smors.ph').toLowerCase(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'SmorsAdmin#2026',
  EXIT_ON_DB_FAIL: process.env.EXIT_ON_DB_FAIL === 'true'
}

export const SHIPPING = {
  jt: 150,
  door2door: 120,
  FREE_THRESHOLD: 3500
}

export const isProd = () => env.NODE_ENV === 'production'
