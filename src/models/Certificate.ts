import mongoose, { Schema, Document, models } from "mongoose";

export interface CertificateDocument extends Document {
  name: string;
  issuer: string;
  link?: string;
  date?: string;
  imageUrl?: string;
}

const CertificateSchema = new Schema<CertificateDocument>(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    link: String,
    date: String,
    imageUrl: String,
  },
  { timestamps: true }
);

const Certificate =
  models.Certificate ||
  mongoose.model<CertificateDocument>("Certificate", CertificateSchema);

export default Certificate;
