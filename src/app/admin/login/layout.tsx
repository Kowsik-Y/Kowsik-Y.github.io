import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
};

export default async function AdminLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (session) redirect("/admin");
    return <>{children}</>;
}
