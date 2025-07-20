// src/app/dashboard/page.tsx
'use client';

import { ArrowRight, BookOpen, Briefcase, ExternalLink, FilePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// Data dummy untuk menu eksternal
const externalMenus = [
    {
        title: "Buat Pengajuan Baru",
        description: "Mulai proses pengajuan dokumen atau klaim.",
        icon: FilePlus,
        href: "/pengajuan/tambah",
        color: "text-blue-500",
    },
    {
        title: "Lacak Status",
        description: "Lihat status terkini dari semua pengajuan Anda.",
        icon: Briefcase,
        href: "/pengajuan/status",
        color: "text-green-500",
    },
    {
        title: "Panduan Pengguna",
        description: "Baca dokumentasi dan panduan penggunaan sistem.",
        icon: BookOpen,
        href: "/bantuan",
        color: "text-yellow-500",
    },
    {
        title: "Portal Karyawan",
        description: "Akses portal SDM untuk informasi personalia.",
        icon: ExternalLink,
        href: "https://otobos.alfahuma.com/", // Link eksternal
        color: "text-purple-500",
    },
];

export default function DashboardPage() {

    const user = JSON.parse(localStorage.getItem("user") || "{}");


    return (
        <div className="p-6">
            <h2 className="mb-4 text-2xl font-bold">Selamat Datang, {user.username}</h2>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
                Pilih salah satu menu di bawah untuk memulai.
            </p>

            {/* Grid untuk menu-menu */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {externalMenus.map((menu) => (
                    <Link href={menu.href} key={menu.title} target={menu.href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">
                        <Card className="group transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium">{menu.title}</CardTitle>
                                <menu.icon className={`h-6 w-6 ${menu.color}`} />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    {menu.description}
                                </p>
                                <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:underline">
                                    Akses Menu
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}