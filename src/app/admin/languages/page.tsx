"use client";

import AdminTable from "@/components/admin/AdminTable";
import LanguageForm from "@/components/admin/LanguageForm";
import type { ILanguage } from "@/types";

const columns = [
    { key: "name" as keyof ILanguage, label: "Language" },
    { key: "proficiency" as keyof ILanguage, label: "Proficiency" },
    { key: "order" as keyof ILanguage, label: "Order" },
];

export default function AdminLanguagesPage() {
    return (
        <AdminTable<ILanguage>
            title="Languages"
            apiPath="/api/languages"
            columns={columns}
            FormComponent={LanguageForm}
        />
    );
}
