// src/components/layout/AuthGuard.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Menggunakan ikon dari lucide untuk loading

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    // State untuk melacak apakah verifikasi sudah selesai
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');

        // Jika tidak ada token, langsung arahkan ke login
        if (!token) {
            window.location.replace('https://otobos.alfahuma.com');
        } else {
            // Jika token ada, verifikasi selesai dan izinkan konten untuk tampil
            setIsVerified(true);
        }
    }, [router]);

    // Selama verifikasi, tampilkan UI loading
    if (!isVerified) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <p className="ml-2">Memverifikasi sesi...</p>
            </div>
        );
    }

    // Jika verifikasi berhasil (token ditemukan), tampilkan halaman yang diminta
    return <>{children}</>;
}