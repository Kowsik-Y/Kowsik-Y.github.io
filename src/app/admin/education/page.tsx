"use client";

import AdminTable from "@/components/admin/AdminTable";
import EducationForm from "@/components/admin/EducationForm";
import type { IEducation } from "@/types";

const columns = [
    { key: "school" as keyof IEducation, label: "School" },
    { key: "degree" as keyof IEducation, label: "Degree" },
    { key: "years" as keyof IEducation, label: "Years" },
    { key: "location" as keyof IEducation, label: "Location" },
    { key: "order" as keyof IEducation, label: "Order" },
];

export default function AdminEducationPage() {
    return (
        <AdminTable<IEducation>
            title="Education"
            apiPath="/api/education"
            columns={columns}
            FormComponent={EducationForm}
        />
    );
}
