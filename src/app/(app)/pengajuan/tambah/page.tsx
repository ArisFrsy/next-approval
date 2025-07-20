// page.tsx

"use client";

import { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    CalendarDays, HeartPulse, Clock, Home, Briefcase, FileText,
    Heart, UserMinus, Ellipsis, TimerReset, LucideIcon, RectangleEllipsis
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { encrypt } from "@/lib/Encrypt";
import { KategoriPerizinanResponse } from "@/model/responses/pengajuanResponse";
import { toast } from 'sonner';
import { fetchKategoriPerizinan } from '@/lib/api/kategoriPerizinanClient';
import Loading from '@/components/layout/Spinner';

// Peta untuk ikon
const iconMap: Record<string, LucideIcon> = {
    CalendarDays, HeartPulse, Clock, Home, Briefcase, FileText,
    Heart, UserMinus, TimerReset, Ellipsis,
};

// 👇 PETA WARNA: Daftarkan semua kemungkinan nilai `icon_color` dari DB di sini.
const colorMap: Record<string, string> = {
    "text-blue-500": "text-blue-500",
    "text-red-500": "text-red-500",
    "text-orange-500": "text-orange-500",
    "text-green-500": "text-green-500",
    "text-indigo-500": "text-indigo-500",
    "text-amber-500": "text-amber-500",
    "text-rose-500": "text-rose-500",
    "text-slate-500": "text-slate-500",
    "text-gray-500": "text-gray-500",
};

export default function BuatPengajuanPage() {
    const router = useRouter();
    const [dataKategori, setDataKategori] = useState<KategoriPerizinanResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        try {
            setIsLoading(true);
            fetchKategoriPerizinan()
                .then((data) => {
                    setDataKategori(data.data)
                }).finally(() => {
                    setIsLoading(false);
                })
        } catch {
            toast.error("Gagal memuat kategori pengajuan. Silakan coba lagi.");
        }
    }, [])

    const handleCategoryClick = (categoryId: number, categoryName: string) => {
        const encryptedId = encrypt(categoryId.toString());
        const encryptedName = encrypt(categoryName);
        const targetUrl = `/pengajuan/tambah/${encryptedId}/${encodeURIComponent(encryptedName)}`;
        router.push(targetUrl);
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">
                    Buat Pengajuan Baru
                </h2>
                <p className="text-muted-foreground mt-1">
                    Pilih salah satu jenis pengajuan di bawah ini.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {dataKategori.map((item) => {
                    const Icon = iconMap[item.icon_name ?? ''] || RectangleEllipsis;

                    // Ambil kelas warna dari peta. Jika tidak ada, gunakan abu-abu sebagai default.
                    const iconColorClass = colorMap[item.icon_color ?? ''] || "text-gray-500";

                    return (
                        <div
                            key={item.id}
                            className="transform transition-transform duration-200 hover:scale-105"
                            onClick={() => handleCategoryClick(item.id, item.nama)}
                        >
                            <Card className="h-full cursor-pointer hover:bg-accent dark:hover:bg-gray-800 transition-colors">
                                <CardHeader className="flex flex-col items-center justify-center p-4 text-center">
                                    {/* Terapkan kelas warna yang sudah aman */}
                                    <Icon className={cn("w-10 h-10 mb-3", iconColorClass)} />
                                    <CardTitle className="text-sm font-semibold">
                                        {item.nama}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                    );
                })}
            </div>
            {isLoading && <Loading />}
        </div>
    );
}