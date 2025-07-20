import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import Footer from "@/components/layout/footer";
import AuthGuard from "@/components/layout/AuthGuard";
import { Toaster } from 'sonner';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="flex h-screen w-full bg-muted/40">
                {/* Sidebar Desktop: akan tetap statis di kiri */}
                <Sidebar />

                {/* Konten Utama */}
                <div className="flex flex-1 flex-col">
                    {/* Header: akan tetap statis di atas */}
                    <Header />

                    {/* ## PERUBAHAN DI SINI ## */}
                    {/* flex-1 membuat area ini mengisi sisa ruang */}
                    {/* overflow-y-auto membuat HANYA area ini yang bisa di-scroll */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                        {children}
                    </main>

                    {/* Footer: akan tetap statis di bawah */}
                    <Footer />
                </div>
                <Toaster position="top-right" richColors />
            </div>
        </AuthGuard>
    );
}