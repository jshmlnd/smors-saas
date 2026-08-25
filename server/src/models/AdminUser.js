import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const { Schema } = mongoose

const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: 'SMORS Admin' },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
)

adminUserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compareSync(plain, this.passwordHash)
}

adminUserSchema.statics.hashPassword = (plain) => bcrypt.hashSync(plain, 10)

export default mongoose.model('AdminUser', adminUserSchema)
