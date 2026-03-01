import mongoose, { Schema, Document, models } from "mongoose";

export interface SkillDocument extends Document {
  name: string;
  category: "Tech" | "Tool" | "Soft";
  icon?: string;
}

const SkillSchema = new Schema<SkillDocument>(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["Tech", "Tool", "Soft"],
      default: "Tech",
    },
    icon: String,
  },
  { timestamps: true }
);

const Skill =
  models.Skill || mongoose.model<SkillDocument>("Skill", SkillSchema);

export default Skill;
