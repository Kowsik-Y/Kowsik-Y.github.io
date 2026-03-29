import type { BreadcrumbItem } from "@/types";

export function sectionBreadcrumbs(label: string, href: string): BreadcrumbItem[] {
    return [
        { label: "Home", href: "/" },
        { label, href, current: true },
    ];
}

export function detailBreadcrumbs(
    sectionLabel: string,
    sectionHref: string,
    currentLabel: string,
    currentHref: string
): BreadcrumbItem[] {
    return [
        { label: "Home", href: "/" },
        { label: sectionLabel, href: sectionHref },
        { label: currentLabel, href: currentHref, current: true },
    ];
}