"use client";

import AdminTable from "@/components/admin/AdminTable";
import SkillForm from "@/components/admin/SkillForm";
import type { ISkill } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
    Tech: "text-violet-300 bg-violet-500/10 border-violet-500/20",
    Tool: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
    Soft: "text-pink-300 bg-pink-500/10 border-pink-500/20",
};

const columns = [
    { key: "name" as keyof ISkill, label: "Skill" },
    {
        key: "category" as keyof ISkill,
        label: "Category",
        render: (val: unknown) => (
            <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${CATEGORY_COLORS[String(val)] ?? ""
                    }`}
            >
                {String(val)}
            </span>
        ),
    },
];

export default function AdminSkills() {
    return (
        <AdminTable<ISkill>
            title="Skills"
            apiPath="/api/skills"
            columns={columns}
            FormComponent={SkillForm}
            emptyMessage="No skills yet. Add your first one!"
        />
    );
}
