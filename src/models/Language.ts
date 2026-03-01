import mongoose, { Schema, Document, models } from "mongoose";

export interface LanguageDocument extends Document {
  name: string;
  proficiency: string;
  order: number;
}

const LanguageSchema = new Schema<LanguageDocument>(
  {
    name: { type: String, required: true },
    proficiency: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Language =
  models.Language ||
  mongoose.model<LanguageDocument>("Language", LanguageSchema);

export default Language;
