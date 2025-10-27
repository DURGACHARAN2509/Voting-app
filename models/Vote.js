import mongoose from 'mongoose';
const { Schema } = mongoose;

const VoteSchema = new Schema({
  election: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
  candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
  voter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

VoteSchema.index({ election: 1, voter: 1 }, { unique: true }); // ensures one vote per user per election

export default mongoose.model('Vote', VoteSchema);
