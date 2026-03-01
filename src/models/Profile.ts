import mongoose, { Schema, models } from "mongoose";

const ProfileSchema = new Schema(
  {
    // Singleton key — only ever one document
    _key: { type: String, default: "main", unique: true },
    name: { type: String, default: "" },
    title: { type: String, default: "" },
    bio: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    email: { type: String, default: "" },
    leetcodeUrl: { type: String, default: "" },
    hackerrankUrl: { type: String, default: "" },
    githubStatsUrl: { type: String, default: "" },
    githubStreakUrl: { type: String, default: "" },
    snakeSourceUrl: { type: String, default: "" },
    websiteUrl: { type: String, default: "" },
    cgpa: { type: String, default: "" },
    semester: { type: String, default: "" },
    interests: { type: [String], default: [] },
    availability: { type: String, default: "" },
    customLinks: { type: [{ label: String, url: String }], default: [] },
    githubActivityLinks: { type: [{ label: String, url: String }], default: [] },
  },
  { timestamps: true }
);

const Profile = models.Profile || mongoose.model("Profile", ProfileSchema);
export default Profile;
