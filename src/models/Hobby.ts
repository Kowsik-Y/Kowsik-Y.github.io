import mongoose, { Schema, Document, models } from "mongoose";

export interface HobbyDocument extends Document {
  name: string;
  order: number;
}

const HobbySchema = new Schema<HobbyDocument>(
  {
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Hobby =
  models.Hobby || mongoose.model<HobbyDocument>("Hobby", HobbySchema);

export default Hobby;
