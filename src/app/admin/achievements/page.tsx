"use client";

import AdminTable from "@/components/admin/AdminTable";
import AchievementForm from "@/components/admin/AchievementForm";
import type { IAchievement } from "@/types";

const columns = [
    { key: "title" as keyof IAchievement, label: "Title" },
    { key: "org" as keyof IAchievement, label: "Organization" },
    { key: "date" as keyof IAchievement, label: "Date" },
];

export default function AdminAchievements() {
    return (
        <AdminTable<IAchievement>
            title="Achievements"
            apiPath="/api/achievements"
            columns={columns}
            FormComponent={AchievementForm}
            emptyMessage="No achievements yet. Add your first one!"
        />
    );
}
