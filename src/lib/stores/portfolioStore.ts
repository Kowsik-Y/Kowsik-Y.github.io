"use client";

import { create } from "zustand";
import type {
    IAchievement,
    IBlog,
    ICertificate,
    IEducation,
    IHobby,
    ILanguage,
    IPortfolioOverviewResponse,
    IProfile,
    IProject,
    ISkill,
} from "@/types";

type OverviewFetchOptions = {
    force?: boolean;
    includeAdminMeta?: boolean;
    includeHeavyMedia?: boolean;
};

type PortfolioState = {
    hydrated: boolean;
    loading: boolean;
    error: string | null;
    profile: IProfile | null;
    projects: IProject[];
    blogs: IBlog[];
    skills: ISkill[];
    education: IEducation[];
    languages: ILanguage[];
    hobbies: IHobby[];
    certificates: ICertificate[];
    achievements: IAchievement[];
    summary: IPortfolioOverviewResponse["summary"];
    lastLoadedAt: number | null;
    setOverview: (data: IPortfolioOverviewResponse) => void;
    fetchOverview: (options?: OverviewFetchOptions) => Promise<void>;
    invalidate: () => void;
};

const EMPTY_SUMMARY: IPortfolioOverviewResponse["summary"] = {
    projectsCount: 0,
    blogsCount: 0,
    certificatesCount: 0,
    achievementsCount: 0,
    skillsCount: 0,
    educationCount: 0,
    languagesCount: 0,
    hobbiesCount: 0,
};

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
    hydrated: false,
    loading: false,
    error: null,
    profile: null,
    projects: [],
    blogs: [],
    skills: [],
    education: [],
    languages: [],
    hobbies: [],
    certificates: [],
    achievements: [],
    summary: EMPTY_SUMMARY,
    lastLoadedAt: null,
    setOverview: (data) =>
        set({
            hydrated: true,
            loading: false,
            error: null,
            profile: data.profile,
            projects: data.projects,
            blogs: data.blogs,
            skills: data.skills,
            education: data.education,
            languages: data.languages,
            hobbies: data.hobbies,
            certificates: data.certificates,
            achievements: data.achievements,
            summary: data.summary,
            lastLoadedAt: Date.now(),
        }),
    fetchOverview: async (options = {}) => {
        const { force = false, includeAdminMeta = false, includeHeavyMedia = false } = options;
        const state = get();
        if (!force && (state.hydrated || state.loading)) return;

        set({ loading: true, error: null });

        try {
            const params = new URLSearchParams();
            if (includeAdminMeta) params.set("includeAdminMeta", "1");
            if (includeHeavyMedia) params.set("includeHeavyMedia", "1");
            const query = params.toString();
            const res = await fetch(`/api/portfolio-overview${query ? `?${query}` : ""}`, {
                cache: "no-store",
            });

            if (!res.ok) {
                throw new Error(`Overview request failed with status ${res.status}`);
            }

            const data = (await res.json()) as IPortfolioOverviewResponse;
            get().setOverview(data);
        } catch (error) {
            set({
                loading: false,
                error: error instanceof Error ? error.message : "Failed to load portfolio overview",
            });
        }
    },
    invalidate: () =>
        set({
            hydrated: false,
            lastLoadedAt: null,
            error: null,
        }),
}));
