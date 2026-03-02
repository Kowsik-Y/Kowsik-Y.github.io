import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Certifications",
    description:
        "Professional certifications and credentials earned by Kowsik Y in AI, ML, and software development.",
    openGraph: {
        title: "Certifications — Kowsik Y",
        description:
            "Professional certifications and credentials in AI, ML, and software development.",
        url: "/certifications",
    },
    twitter: {
        title: "Certifications — Kowsik Y",
        description: "Professional certifications and credentials by Kowsik Y.",
    },
};

export default function CertificationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
