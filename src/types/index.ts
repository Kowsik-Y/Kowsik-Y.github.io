export interface IProject {
  _id: string;
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
  createdAt?: string;
}

export interface IBlog {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICertificate {
  _id: string;
  name: string;
  issuer: string;
  link?: string;
  date?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface IAchievement {
  _id: string;
  title: string;
  description: string;
  org?: string;
  date?: string;
  imageUrl?: string;
  link?: string;
  createdAt?: string;
}

export interface ISkill {
  _id: string;
  name: string;
  category: "Tech" | "Tool" | "Soft";
  icon?: string;
  createdAt?: string;
}

export interface IEducation {
  _id: string;
  school: string;
  degree: string;
  years: string;
  detail?: string;
  location?: string;
  mapsUrl?: string;
  order: number;
  createdAt?: string;
}

export interface ILanguage {
  _id: string;
  name: string;
  proficiency: string;
  order: number;
  createdAt?: string;
}

export interface IHobby {
  _id: string;
  name: string;
  order: number;
  createdAt?: string;
}

export interface IProfile {
  _id?: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  email?: string;
  leetcodeUrl?: string;
  hackerrankUrl?: string;
  githubStatsUrl?: string;
  githubStreakUrl?: string;
  snakeSourceUrl?: string;
  websiteUrl?: string;
  cgpa?: string;
  semester?: string;
  interests?: string[];
  availability?: string;
  customLinks?: { label: string; url: string }[];
  githubActivityLinks?: { label: string; url: string }[];
}

export interface IPortfolioSummary {
  projectsCount: number;
  blogsCount: number;
  certificatesCount: number;
  achievementsCount: number;
  skillsCount: number;
  educationCount: number;
  languagesCount: number;
  hobbiesCount: number;
}

export interface IAdminOverview {
  profileName: string;
  profileTitle: string;
  updatedAt?: string;
}

export interface IPortfolioOverviewResponse {
  profile: IProfile | null;
  projects: IProject[];
  blogs: IBlog[];
  skills: ISkill[];
  education: IEducation[];
  languages: ILanguage[];
  hobbies: IHobby[];
  certificates: ICertificate[];
  achievements: IAchievement[];
  summary: IPortfolioSummary;
  adminOverview?: IAdminOverview;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}
