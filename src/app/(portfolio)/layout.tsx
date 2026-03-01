import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/layout/ChatWidget";

export default function PortfolioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <ChatWidget />
        </>
    );
}
