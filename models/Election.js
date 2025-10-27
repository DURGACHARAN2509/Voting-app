import mongoose from 'mongoose';
const { Schema } = mongoose;

const ElectionSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  active: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date
}, { timestamps: true });

export default mongoose.model('Election', ElectionSchema);
