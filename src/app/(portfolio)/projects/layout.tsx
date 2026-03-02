import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Projects",
    description:
        "Explore AI, ML, and full-stack projects by Kowsik Y — from intelligent agents to web applications.",
    openGraph: {
        title: "Projects — Kowsik Y",
        description:
            "Explore AI, ML, and full-stack projects — from intelligent agents to web applications.",
        url: "/projects",
    },
    twitter: {
        title: "Projects — Kowsik Y",
        description:
            "Explore AI, ML, and full-stack projects by Kowsik Y.",
    },
};

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
