import mongoose from 'mongoose';

const EmailLogSchema = new mongoose.Schema(
  { to: String, subject: String, sentAt: Date, providerId: String },
  { _id: false }
);

const SummarySchema = new mongoose.Schema(
  {
    title: { type: String },
    transcriptText: { type: String, required: true },
    instruction: { type: String, required: true },
    summaryText: { type: String, required: true },
    provider: { type: String },
    tokenUsage: { type: Object },
    emailsSent: { type: [EmailLogSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Summary', SummarySchema);
