"use client";

import AdminTable from "@/components/admin/AdminTable";
import HobbyForm from "@/components/admin/HobbyForm";
import type { IHobby } from "@/types";

const columns = [
    { key: "name" as keyof IHobby, label: "Hobby" },
    { key: "order" as keyof IHobby, label: "Order" },
];

export default function AdminHobbiesPage() {
    return (
        <AdminTable<IHobby>
            title="Hobbies"
            apiPath="/api/hobbies"
            columns={columns}
            FormComponent={HobbyForm}
        />
    );
}
