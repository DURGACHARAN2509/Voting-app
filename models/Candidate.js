import mongoose from 'mongoose';
const { Schema } = mongoose;

const CandidateSchema = new Schema({
  election: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
  name: { type: String, required: true },
  party: String,
  details: String
}, { timestamps: true });

export default mongoose.model('Candidate', CandidateSchema);
