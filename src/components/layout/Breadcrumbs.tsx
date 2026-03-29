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

    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex flex-wrap items-center gap-2 text-sm">
                {items.map((item, index) => {
                    const isLast = item.current || index === items.length - 1;

                    return (
                        <li key={`${item.href}-${item.label}`} className="inline-flex items-center gap-2">
                            {isLast ? (
                                <span
                                    aria-current="page"
                                    className="max-w-[14rem] truncate text-slate-200 sm:max-w-[26rem]"
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="text-slate-400 hover:text-violet-400 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            )}
                            {!isLast && <ChevronRight size={14} className="text-slate-600" aria-hidden="true" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
