import mongoose, { Schema, Document, models } from "mongoose";

export interface AchievementDocument extends Document {
  title: string;
  description: string;
  org?: string;
  date?: string;
  imageUrl?: string;
  link?: string;
}

const AchievementSchema = new Schema<AchievementDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    org: String,
    date: String,
    imageUrl: String,
    link: String,
  },
  { timestamps: true }
);

const Achievement =
  models.Achievement ||
  mongoose.model<AchievementDocument>("Achievement", AchievementSchema);

export default Achievement;
