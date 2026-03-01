import mongoose, { Schema, Document, models } from "mongoose";

export interface EducationDocument extends Document {
  school: string;
  degree: string;
  years: string;
  detail?: string;
  location?: string;
  mapsUrl?: string;
  order: number;
}

const EducationSchema = new Schema<EducationDocument>(
  {
    school: { type: String, required: true },
    degree: { type: String, required: true },
    years: { type: String, required: true },
    detail: String,
    location: String,
    mapsUrl: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Education =
  models.Education ||
  mongoose.model<EducationDocument>("Education", EducationSchema);

export default Education;
