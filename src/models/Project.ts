import mongoose, { Schema, Document, models } from "mongoose";

export interface ProjectDocument extends Document {
  slug?: string;
  title: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  otherLinks?: { label: string; url: string }[];
  imageUrl?: string;
  screenshots: string[];
  featured: boolean;
  order: number;
}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    slug: { type: String, index: true, unique: true, sparse: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: String,
    techStack: { type: [String], default: [] },
    githubUrl: String,
    liveUrl: String,
    otherLinks: [{ label: String, url: String }],
    imageUrl: String,
    screenshots: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Project =
  models.Project || mongoose.model<ProjectDocument>("Project", ProjectSchema);

export default Project;
