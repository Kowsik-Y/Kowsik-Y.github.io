"use client";

import { create } from "zustand";
import type { IPortfolioOverviewResponse } from "@/types";

type AdminCollectionMap = Partial<Record<string, unknown[]>>;

type AdminState = {
    collections: AdminCollectionMap;
    loadingByPath: Record<string, boolean>;
    setCollection: (apiPath: string, data: unknown[]) => void;
    getCollection: <T>(apiPath: string) => T[] | undefined;
    hydrateFromOverview: (overview: IPortfolioOverviewResponse) => void;
    fetchCollection: <T>(apiPath: string, force?: boolean) => Promise<T[] | undefined>;
};

const PATH_TO_OVERVIEW_KEY: Partial<Record<string, keyof IPortfolioOverviewResponse>> = {
    "/api/projects": "projects",
    "/api/blogs": "blogs",
    "/api/skills": "skills",
    "/api/education": "education",
    "/api/languages": "languages",
    "/api/hobbies": "hobbies",
    "/api/certificates": "certificates",
    "/api/achievements": "achievements",
};

export const useAdminStore = create<AdminState>((set, get) => ({
    collections: {},
    loadingByPath: {},
    setCollection: (apiPath, data) =>
        set((state) => ({
            collections: {
                ...state.collections,
                [apiPath]: data,
            },
            loadingByPath: {
                ...state.loadingByPath,
                [apiPath]: false,
            },
        })),
    getCollection: <T>(apiPath: string) => get().collections[apiPath] as T[] | undefined,
    hydrateFromOverview: (overview) => {
        const updates: AdminCollectionMap = {};
        for (const [apiPath, key] of Object.entries(PATH_TO_OVERVIEW_KEY)) {
            if (!key) continue;
            const value = overview[key];
            if (Array.isArray(value)) {
                updates[apiPath] = value;
            }
        }

        set((state) => ({
            collections: {
                ...state.collections,
                ...updates,
            },
        }));
    },
    fetchCollection: async <T>(apiPath: string, force = false) => {
        const cached = get().getCollection<T>(apiPath);
        const loading = get().loadingByPath[apiPath];
        if (!force && cached) return cached;
        if (loading) return cached;

        set((state) => ({
            loadingByPath: {
                ...state.loadingByPath,
                [apiPath]: true,
            },
        }));

        try {
            const res = await fetch(apiPath);
            if (!res.ok) throw new Error("Fetch failed");
            const data = (await res.json()) as T[];
            get().setCollection(apiPath, data as unknown[]);
            return data;
        } catch {
            set((state) => ({
                loadingByPath: {
                    ...state.loadingByPath,
                    [apiPath]: false,
                },
            }));
            return cached;
        }
    },
}));
