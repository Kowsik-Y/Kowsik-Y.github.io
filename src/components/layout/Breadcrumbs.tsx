"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/types";

type BreadcrumbsProps = {
    items: BreadcrumbItem[];
    className?: string;
};

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    if (!items.length) return null;

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            item: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me"}${item.href}`,
        })),
    };

    return (
        <nav aria-label="Breadcrumb" className={className}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <ol className="flex flex-wrap items-center gap-2 text-sm">
                {items.map((item, index) => {
                    const isLast = item.current || index === items.length - 1;

                    return (
                        <li key={`${item.href}-${item.label}`} className="inline-flex items-center gap-2">
                            {isLast ? (
                                <span
                                    aria-current="page"
                                    className="max-w-56 truncate text-foreground sm:max-w-104"
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {item.label}
                                </Link>
                            )}
                            {!isLast && <ChevronRight size={14} className="text-border" aria-hidden="true" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
