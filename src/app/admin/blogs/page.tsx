"use client";

import Image from "next/image";
import AdminTable from "@/components/admin/AdminTable";
import BlogForm from "@/components/admin/BlogForm";
import { blobDisplayUrl } from "@/lib/blob-url";
import type { IBlog } from "@/types";

const columns = [
    {
        key: "coverImage" as keyof IBlog,
        label: "Cover",
        render: (val: unknown, row: IBlog) =>
            val ? (
                <div className="relative w-12 h-8 rounded-lg overflow-hidden border border-white/10 bg-white/5 shrink-0">
                    <Image src={blobDisplayUrl(val as string)} alt={row.title} fill className="object-cover" unoptimized />
                </div>
            ) : (
                <span className="text-slate-600 text-xs">No image</span>
            ),
    },
    { key: "title" as keyof IBlog, label: "Title" },
    {
        key: "slug" as keyof IBlog,
        label: "Slug",
        render: (val: unknown) => <span className="text-slate-400 text-xs">/{String(val ?? "")}</span>,
    },
    {
        key: "tags" as keyof IBlog,
        label: "Tags",
        render: (val: unknown) =>
            Array.isArray(val) ? <span className="text-slate-500 text-xs">{(val as string[]).join(", ")}</span> : null,
    },
    {
        key: "published" as keyof IBlog,
        label: "Published",
        render: (val: unknown) =>
            val ? <span className="text-emerald-400 text-xs font-medium">Yes</span> : <span className="text-slate-600 text-xs">No</span>,
    },
    { key: "order" as keyof IBlog, label: "Order" },
];

export default function AdminBlogsPage() {
    return (
        <AdminTable<IBlog>
            title="Blogs"
            apiPath="/api/blogs"
            columns={columns}
            FormComponent={BlogForm}
            emptyMessage="No blogs yet. Add your first post!"
        />
    );
}
