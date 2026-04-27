type ProjectSlugInput = {
    _id: string;
    title?: string;
    slug?: string;
};

export function slugifyText(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function buildProjectSlug(title: string | undefined, id: string): string {
    const base = slugifyText(title || "project") || "project";
    const suffix = id.slice(-8).toLowerCase();
    return `${base}-${suffix}`;
}

export function normalizeProjectSlug(value: string): string {
    return slugifyText(value) || "project";
}

export function projectPublicSlug(project: ProjectSlugInput): string {
    return project.slug?.trim() || buildProjectSlug(project.title, project._id);
}

export function projectPath(project: ProjectSlugInput): string {
    return `/projects/${projectPublicSlug(project)}`;
}

export function isObjectIdLike(value: string): boolean {
    return /^[a-f\d]{24}$/i.test(value);
}