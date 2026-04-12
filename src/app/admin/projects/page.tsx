"use client";

import Image from "next/image";
import AdminTable from "@/components/admin/AdminTable";
import ProjectForm from "@/components/admin/ProjectForm";
import { blobDisplayUrl } from "@/lib/blob-url";
import type { IProject } from "@/types";

const columns = [
    {
        key: "imageUrl" as keyof IProject,
        label: "Icon",
        render: (val: unknown, row: IProject) =>
            val ? (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-border/60 bg-foreground/5 shrink-0">
                    <Image src={blobDisplayUrl(val as string)} alt={row.title} fill className="object-cover" unoptimized />
                </div>
            ) : (
                <div className="w-10 h-10 rounded-xl border border-border/60 bg-violet-500/15 flex items-center justify-center text-violet-600 dark:text-violet-300 text-sm font-bold shrink-0">
                    {row.title?.charAt(0) ?? "?"}
                </div>
            ),
    },
    { key: "title" as keyof IProject, label: "Title" },
    {
        key: "techStack" as keyof IProject,
        label: "Stack",
        render: (val: unknown) =>
            Array.isArray(val) ? (
                <span className="text-muted-foreground/80 text-xs">{(val as string[]).join(", ")}</span>
            ) : null,
    },
    {
        key: "featured" as keyof IProject,
        label: "Featured",
        render: (val: unknown) =>
            val ? (
                <span className="text-amber-400 text-xs font-medium">★ Yes</span>
            ) : (
                <span className="text-muted-foreground text-xs">No</span>
            ),
    },
    { key: "order" as keyof IProject, label: "Order" },
];

export default function AdminProjects() {
    return (
        <AdminTable<IProject>
            title="Projects"
            apiPath="/api/projects"
            columns={columns}
            FormComponent={ProjectForm}
            emptyMessage="No projects yet. Add your first one!"
        />
    );
}
