// app/dashboard/bantuan/page.tsx
"use client";

import React, { useState, useMemo } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, LifeBuoy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- Data untuk FAQ (Tanya Jawab) ---
const faqData = [
    {
        category: "Dasar & Memulai",
        question: "Apa fungsi utama dari aplikasi ini?",
        answer: "Aplikasi ini dirancang untuk mempermudah proses pengajuan dan persetujuan izin atau cuti secara digital, mulai dari pengajuan oleh pegawai hingga persetujuan berlapis oleh atasan dan HRD."
    },
    {
        category: "Dasar & Memulai",
        question: "Bagaimana cara mengganti kata sandi saya?",
        answer: "Anda dapat mengganti kata sandi melalui menu 'Pengaturan' di sidebar, kemudian pilih tab 'Keamanan'. Masukkan kata sandi lama Anda dan kata sandi baru yang diinginkan."
    },
    {
        category: "Mengajukan Izin/Cuti",
        question: "Bagaimana cara membuat pengajuan baru?",
        answer: "Untuk membuat pengajuan baru, ikuti langkah berikut: \n1. Klik menu 'Pengajuan' di sidebar. \n2. Pilih kategori pengajuan yang sesuai (misal: Cuti Tahunan, Izin Sakit). \n3. Isi formulir secara bertahap, mulai dari detail waktu, alasan, hingga memilih alur persetujuan. \n4. Tinjau kembali data pada halaman konfirmasi, lalu klik 'Kirim Pengajuan'."
    },
    {
        category: "Mengajukan Izin/Cuti",
        question: "Siapa saja yang harus saya pilih sebagai 'Approver'?",
        answer: "Pilih semua pihak yang relevan dan diperlukan untuk menyetujui pengajuan Anda sesuai urutan. Biasanya dimulai dari atasan langsung (Team Lead/Manager), kemudian bisa dilanjutkan ke level yang lebih tinggi atau langsung ke HRD, sesuai kebijakan perusahaan."
    },
    {
        category: "Melacak Status",
        question: "Bagaimana cara melihat status pengajuan yang telah saya buat?",
        answer: "Buka halaman 'Lacak Status' dari sidebar. Pada tab 'Pengajuan Saya', Anda akan melihat daftar semua pengajuan Anda beserta statusnya (Menunggu, Disetujui, Ditolak). Klik pada salah satu kartu untuk melihat detail progres dan catatan dari approver."
    },
    {
        category: "Persetujuan",
        question: "Di mana saya bisa melihat pengajuan yang perlu saya setujui?",
        answer: "Buka halaman 'Lacak Status', lalu pilih tab 'Perlu Persetujuan Saya'. Semua pengajuan yang ditujukan kepada Anda akan muncul di sana. Klik kartu untuk melihat detail dan melakukan aksi (Setujui/Tolak)."
    },
    {
        category: "Persetujuan",
        question: "Apakah saya bisa menambahkan catatan saat menolak atau menyetujui?",
        answer: "Ya. Saat Anda membuka detail pengajuan di tab 'Perlu Persetujuan Saya', akan tersedia kolom 'Catatan (Opsional)'. Isi kolom ini untuk memberikan alasan atau keterangan tambahan sebelum menekan tombol 'Tolak' atau 'Setujui'."
    },
];

// --- Komponen Halaman Bantuan ---
export default function BantuanPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFaqs = useMemo(() => {
        if (!searchTerm) return faqData;
        return faqData.filter(faq =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const groupedFaqs = useMemo(() => {
        return filteredFaqs.reduce((acc, faq) => {
            (acc[faq.category] = acc[faq.category] || []).push(faq);
            return acc;
        }, {} as Record<string, typeof faqData>);
    }, [filteredFaqs]);

    return (
        <div className="container mx-auto max-w-4xl p-4 md:p-8">
            {/* Header Halaman */}
            <div className="text-center mb-10">
                <LifeBuoy className="mx-auto h-12 w-12 text-primary mb-4" />
                <h1 className="text-4xl font-bold tracking-tight">Pusat Bantuan</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Temukan jawaban atas pertanyaan Anda atau pelajari cara menggunakan aplikasi.
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Ketik pertanyaan Anda di sini..."
                    className="pl-10 h-12 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Konten FAQ dengan Accordion */}
            {Object.keys(groupedFaqs).length > 0 ? (
                <div className="space-y-8">
                    {Object.entries(groupedFaqs).map(([category, faqs]) => (
                        <div key={category}>
                            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{category}</h2>
                            <Accordion type="single" collapsible className="w-full">
                                {faqs.map((faq, index) => (
                                    <AccordionItem value={`item-${category}-${index}`} key={index}>
                                        <AccordionTrigger className="text-left text-base">{faq.question}</AccordionTrigger>
                                        <AccordionContent className="text-base leading-relaxed whitespace-pre-line">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground mt-16">
                    Tidak ada hasil yang cocok dengan pencarian Anda.
                </p>
            )}

            {/* Kartu Bantuan Tambahan */}
            <Card className="mt-16 text-center">
                <CardHeader>
                    <CardTitle>Masih Butuh Bantuan?</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi tim support kami.
                    </p>
                    <Button>Hubungi Dukungan</Button>
                </CardContent>
            </Card>
        </div>
    );
}