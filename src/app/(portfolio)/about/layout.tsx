import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About",
    description:
        "Learn about Kowsik Y — AI & ML engineering student, full-stack developer, and AI agent builder. Explore skills, education, and experience.",
    openGraph: {
        title: "About — Kowsik Y",
        description:
            "AI & ML student, full-stack developer, and AI agent builder. Skills, education, and background.",
        url: "/about",
    },
    twitter: {
        title: "About — Kowsik Y",
        description:
            "AI & ML student, full-stack developer, and AI agent builder.",
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
