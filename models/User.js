import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','user'], default: 'user' },
  gender: { type: String, enum: ['male','female','other'], required: true }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
