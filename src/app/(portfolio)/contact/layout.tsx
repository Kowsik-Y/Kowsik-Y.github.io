import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact",
    description:
        "Get in touch with Kowsik Y — open to collaborations, projects, and opportunities in AI, ML, and full-stack development.",
    openGraph: {
        title: "Contact — Kowsik Y",
        description:
            "Open to collaborations, projects, and opportunities in AI & ML.",
        url: "/contact",
    },
    twitter: {
        title: "Contact — Kowsik Y",
        description: "Get in touch with Kowsik Y for collaborations and projects.",
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
