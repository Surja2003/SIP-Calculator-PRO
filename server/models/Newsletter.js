import mongoose from 'mongoose';

const NewsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model('Newsletter', NewsletterSchema);
