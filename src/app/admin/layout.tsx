import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SessionProvider from "@/components/admin/SessionProvider";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // No session: middleware already redirects protected routes to /admin/login.
    // Render children directly so the login page can display without a redirect loop.
    if (!session) return <>{children}</>;

    return (
        <SessionProvider session={session}>
            <div className="flex min-h-screen">
                <AdminSidebar />
                <main className="flex-1 p-8 overflow-auto">{children}</main>
            </div>
        </SessionProvider>
    );
}
