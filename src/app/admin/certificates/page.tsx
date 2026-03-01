"use client";

import AdminTable from "@/components/admin/AdminTable";
import CertificateForm from "@/components/admin/CertificateForm";
import type { ICertificate } from "@/types";

const columns = [
    { key: "name" as keyof ICertificate, label: "Name" },
    { key: "issuer" as keyof ICertificate, label: "Issuer" },
    { key: "date" as keyof ICertificate, label: "Date" },
];

export default function AdminCertificates() {
    return (
        <AdminTable<ICertificate>
            title="Certificates"
            apiPath="/api/certificates"
            columns={columns}
            FormComponent={CertificateForm}
            emptyMessage="No certificates yet. Add your first one!"
        />
    );
}
