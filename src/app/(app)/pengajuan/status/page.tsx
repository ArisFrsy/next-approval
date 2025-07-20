"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CircleCheck, CircleX, Clock, User, MessageSquareQuote, Eye, Calendar as CalendarIcon } from 'lucide-react';
import { fetchPengajuan, fetchPersetujuan, postPengajuanPersetujuan } from '@/lib/api/pengajuanClient';
import { PengajuanApprovalResponse, PengajuanResponse } from '@/model/responses/pengajuanResponse';
import Loading from '@/components/layout/Spinner';
import { formatTime } from '@/utils/utils';
import { confirmDialog } from '@/lib/confirm-dialog';
import { KategoriPerizinanResponse } from '@/model/responses/kategoriPerizinanResponse';
import { fetchKategoriPerizinan } from '@/lib/api/kategoriPerizinanClient';

export default function LacakStatusPage() {
    const [isLoading, setIsLoading] = useState(false);
    // State Tab 1
    const [filterStatus1, setFilterStatus1] = useState('Semua');
    const [filterCategory1, setFilterCategory1] = useState('Semua');
    const [dateRange1, setDateRange1] = useState<DateRange | undefined>();
    const [currentPage1, setCurrentPage1] = useState(1);
    const [dataPengajuan, setDataPengajuan] = useState<PengajuanResponse[] | []>([]);
    const [dataPersetujuan, setDataPersetujuan] = useState<PengajuanApprovalResponse[]>([]);
    const [totalPagesPersetujuan, setTotalPagesPersetujuan] = useState(0);
    const [dataKategori, setDataKategori] = useState<KategoriPerizinanResponse[]>([]);

    const [notes, setNotes] = useState('');

    // State untuk Dialog Pratinjau Gambar
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    const [imageToShow, setImageToShow] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 10;
    const user = JSON.parse(localStorage.getItem('user') || '{}'); // Simulasi user login
    const [totalPages1, setTotalPages1] = useState(1);

    useEffect(() => {
        setIsLoading(true);
        fetchKategoriPerizinan()
            .then((data) => {
                setDataKategori(data.data);
            }).finally(() => {
                setIsLoading(false);
            })
    }, [])


    useEffect(() => {
        setIsLoading(true);
        const status = filterStatus1 === 'Semua' ? undefined : filterStatus1;
        const tanggalMulai = dateRange1?.from?.toISOString();
        const tanggalSelesai = dateRange1?.to?.toISOString();

        fetchPengajuan({
            page: currentPage1,
            perPage: ITEMS_PER_PAGE,
            pegawai_id: user?.id,
            status,
            tanggal_mulai: tanggalMulai,
            tanggal_selesai: tanggalSelesai,
            kategori_id: filterCategory1 !== 'Semua' ? parseInt(filterCategory1) : undefined
        })
            .then((data) => {
                setDataPengajuan(data.data);
                setTotalPages1(data.total ? Math.ceil(data.total / ITEMS_PER_PAGE) : 1);
            }).finally(() => {
                setIsLoading(false);
            });
    }, [
        filterStatus1,
        filterCategory1,
        dateRange1?.from, // stabilkan dependensi
        dateRange1?.to,
        currentPage1,
        user?.id, // pastikan user sudah ada
    ]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchPersetujuan({
                approver_id: user?.id,
            });
            setDataPersetujuan(data.data);
            setTotalPagesPersetujuan(data.total ? data.total : 0);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Fungsi Aksi
    const handleApprovalAction = async (requestId: number, action: 'Disetujui' | 'Ditolak') => {

        const confirm = await confirmDialog({
            title: 'Konfirmasi',
            description: 'Apakah Anda yakin terkait pesetujuan ini akan ' + action + ' ?',
            confirmText: 'Ya, Benar',
            cancelText: 'Batal',
        });

        if (!confirm.confirmed) {
            return; // User cancelled the operation
        }
        setIsLoading(true);
        try {
            postPengajuanPersetujuan({
                pengajuan_id: requestId,
                status: action,
                approver_id: user?.id,
                catatan: notes || undefined, // Hanya kirim catatan jika ada
            }).then(() => {
                setNotes(''); // Reset catatan setelah aksi
                fetchData(); // Refresh data persetujuan
            })
        } catch {
            fetchData();
            setNotes('');
            setIsLoading(false);
        }
    };

    const openImagePreview = (url: string) => {
        setImageToShow(url);
        setIsImagePreviewOpen(true);
    };

    return (
        <>
            <div className="p-4 md:p-6 lg:p-8">
                <h1 className="text-3xl font-bold tracking-tight mb-6">Lacak Status Pengajuan</h1>
                <Tabs defaultValue="pengajuan-saya" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                        <TabsTrigger value="pengajuan-saya">Pengajuan Saya</TabsTrigger>
                        <TabsTrigger value="perlu-persetujuan" className="relative">
                            Perlu Persetujuan Saya
                            {totalPagesPersetujuan > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-red-500 text-white">
                                    {totalPagesPersetujuan}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pengajuan-saya">
                        <Card>
                            <CardHeader>
                                <CardTitle>Daftar Pengajuan Anda</CardTitle>
                                <CardDescription>Klik pada setiap pengajuan untuk melihat detailnya.</CardDescription>
                                <div className="flex flex-wrap items-center gap-2 pt-4">
                                    <Select value={filterStatus1} onValueChange={setFilterStatus1}><SelectTrigger className="w-full sm:w-auto"><SelectValue placeholder="Filter status" /></SelectTrigger><SelectContent><SelectItem value="Semua">Semua Status</SelectItem><SelectItem value="Menunggu">Menunggu</SelectItem><SelectItem value="Disetujui">Disetujui</SelectItem><SelectItem value="Ditolak">Ditolak</SelectItem></SelectContent></Select>
                                    <Select value={filterCategory1} onValueChange={setFilterCategory1}><SelectTrigger className="w-full sm:w-auto"><SelectValue placeholder="Filter kategori" /></SelectTrigger><SelectContent><SelectItem value="Semua">Semua Kategori</SelectItem>{dataKategori.map(cat => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nama}</SelectItem>)}</SelectContent></Select>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal sm:w-auto", !dateRange1 && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateRange1?.from ? (dateRange1.to ? <>{format(dateRange1.from, "LLL dd, y")} - {format(dateRange1.to, "LLL dd, y")}</> : format(dateRange1.from, "LLL dd, y")) : <span>Pilih rentang tanggal</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" defaultMonth={dateRange1?.from} selected={dateRange1} onSelect={setDateRange1} numberOfMonths={2} /></PopoverContent>
                                    </Popover>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {dataPengajuan.length > 0 ? (
                                    <Accordion type="single" collapsible className="w-full space-y-4">
                                        {dataPengajuan.map(submission => (
                                            <AccordionItem
                                                value={submission.id.toString()}
                                                key={submission.id}
                                                className={cn("border rounded-lg", submission.status === 'Disetujui' && "border-green-500/40", submission.status === 'Ditolak' && "border-red-500/40", submission.status === 'Menunggu' && "border-blue-500/40")}>
                                                <AccordionTrigger
                                                    className="p-4 hover:no-underline data-[state=open]:border-b">
                                                    <div className="flex flex-row items-start justify-between w-full">
                                                        <div>
                                                            <p className="font-semibold text-left">{submission.kategori_perizinan?.nama}</p>
                                                            <p className="text-sm text-muted-foreground text-left">Diajukan: {submission.tanggal_mulai ? new Date(submission.tanggal_mulai).toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            }) : " - "}</p>
                                                        </div>
                                                        <Badge variant={submission.status === 'Disetujui' ? 'default' : submission.status === 'Ditolak' ? 'destructive' : 'secondary'} className={cn("shrink-0", submission.status === 'Disetujui' && "bg-green-500")}>{submission.status}
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="p-4 pt-0">
                                                    <div className="space-y-4 pt-4 border-t">{submission.bukti_url && (
                                                        <div className="space-y-2">
                                                            <div ><p className="text-sm font-semibold">Tanggal Mulai</p>
                                                                <p className="text-sm text-muted-foreground">{submission?.tanggal_mulai ? new Date(submission?.tanggal_mulai).toLocaleDateString('id-ID', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                }) : " - "} - {submission?.jam_mulai ? formatTime(submission?.jam_mulai) : "-"}</p></div>
                                                            <div ><p className="text-sm font-semibold">Tanggal Selesai</p>
                                                                <p className="text-sm text-muted-foreground">{submission?.tanggal_selesai ? new Date(submission?.tanggal_selesai).toLocaleDateString('id-ID', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                }) : " - "} -  {submission?.jam_selesai ? formatTime(submission?.jam_selesai) : "-"}</p></div>
                                                            <p className="text-sm font-semibold">Alasan</p>
                                                            <p
                                                                className="text-sm text-muted-foreground"
                                                                dangerouslySetInnerHTML={{ __html: submission?.alasan || "" }}
                                                            />
                                                            <p className="text-sm font-semibold">Bukti Lampiran</p>
                                                            <div onClick={() => openImagePreview(submission.bukti_url!)} className="relative w-32 h-20 rounded-md overflow-hidden cursor-pointer group border">
                                                                <Image src={`${submission.bukti_url}`} alt="Bukti" layout="fill" className="object-cover" unoptimized />
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Eye className="h-6 w-6 text-white" />
                                                                </div>
                                                            </div>
                                                        </div>)}
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-semibold">Riwayat & Catatan Persetujuan:</p><div className="space-y-4">
                                                                {submission.pengajuan_approval.map((p, index) => (
                                                                    <div key={index} className="flex items-start gap-3 text-sm">
                                                                        {p.status === 'Disetujui' && <CircleCheck className="h-5 w-5 text-green-500 mt-1 shrink-0" />}
                                                                        {p.status === 'Ditolak' && <CircleX className="h-5 w-5 text-red-500 mt-1 shrink-0" />}
                                                                        {p.status === 'Menunggu' && <Clock className="h-5 w-5 text-gray-400 mt-1 shrink-0" />}
                                                                        <div className='flex-1'><p className='font-medium'>{p.user?.username}
                                                                            <span className="text-xs text-muted-foreground">({p.tanggal_approval ? new Date(p.tanggal_approval).toLocaleDateString('id-ID', {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric',
                                                                            }) : " - "})</span>
                                                                        </p>{p.catatan ? (<p className='text-muted-foreground italic flex items-start gap-2 mt-1'>
                                                                            <MessageSquareQuote className='h-4 w-4 shrink-0 mt-0.5' /> &ldquo;{p.catatan}&rdquo;</p>
                                                                        ) : (
                                                                            <p className='text-muted-foreground italic text-xs'>- Tidak ada catatan -</p>)}
                                                                        </div>
                                                                    </div>))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                ) : <p className="text-center text-muted-foreground py-10">Tidak ada data pengajuan yang cocok dengan filter.</p>}
                            </CardContent>
                            <CardFooter>
                                <Pagination><PaginationContent><PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage1(p => Math.max(1, p - 1)) }} /></PaginationItem>{[...Array(totalPages1)].map((_, i) => (<PaginationItem key={i}><PaginationLink href="#" isActive={currentPage1 === i + 1} onClick={(e) => { e.preventDefault(); setCurrentPage1(i + 1) }}>{i + 1}</PaginationLink></PaginationItem>))}<PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage1(p => Math.min(totalPages1, p + 1)) }} /></PaginationItem></PaginationContent></Pagination>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="perlu-persetujuan">
                        <Card>
                            <CardHeader>
                                <CardTitle>Menunggu Persetujuan Anda</CardTitle>
                                <CardDescription>Tinjau dan berikan persetujuan untuk pengajuan di bawah ini.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {dataPersetujuan.length > 0 ? (
                                    <Accordion type="single" collapsible className="w-full space-y-4">
                                        {dataPersetujuan.map(request => (
                                            <AccordionItem value={request.id.toString()} key={request.id} className="border rounded-lg border-blue-500/40">
                                                <AccordionTrigger className="p-4 hover:no-underline data-[state=open]:border-b">
                                                    <div className="flex items-center gap-3 w-full">
                                                        <User className="h-8 w-8 rounded-full bg-muted p-1 shrink-0" />
                                                        <div className="flex-1 text-left">
                                                            <p className="font-semibold">{request.pengajuan?.user_pengajuan_pegawai_idTouser?.username}</p>
                                                            <p className="text-sm text-muted-foreground">{request.pengajuan?.kategori_perizinan?.nama} • Diajukan: {request.pengajuan?.tanggal_mulai ? new Date(request.pengajuan?.tanggal_mulai).toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            }) : " - "}</p></div></div></AccordionTrigger>
                                                <AccordionContent className="p-4 pt-0">
                                                    <div className="space-y-4 pt-4 border-t">
                                                        <div ><p className="text-sm font-semibold">Tanggal Mulai</p>
                                                            <p className="text-sm text-muted-foreground">{request.pengajuan?.tanggal_mulai ? new Date(request.pengajuan?.tanggal_mulai).toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            }) : " - "} - {request.pengajuan?.jam_mulai ? formatTime(request.pengajuan?.jam_mulai) : "-"}</p></div>
                                                        <div ><p className="text-sm font-semibold">Tanggal Selesai</p>
                                                            <p className="text-sm text-muted-foreground">{request.pengajuan?.tanggal_selesai ? new Date(request.pengajuan?.tanggal_selesai).toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            }) : " - "} -  {request.pengajuan?.jam_selesai ? formatTime(request.pengajuan?.jam_selesai) : "-"}</p></div>
                                                        <div ><p className="text-sm font-semibold">Alasan</p>
                                                            <p
                                                                className="text-sm text-muted-foreground"
                                                                dangerouslySetInnerHTML={{ __html: request.pengajuan?.alasan || "" }}
                                                            />
                                                        </div>
                                                        {request.pengajuan?.bukti_url && (<div className="space-y-2">
                                                            <p className="text-sm font-semibold">Bukti Lampiran</p>
                                                            <div onClick={() => {
                                                                if (request.pengajuan?.bukti_url) {
                                                                    openImagePreview(request.pengajuan.bukti_url);
                                                                }
                                                            }}
                                                                className="relative w-32 h-20 rounded-md overflow-hidden cursor-pointer group border">
                                                                <Image src={request.pengajuan.bukti_url} alt="Bukti" layout="fill" className="object-cover" unoptimized />
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Eye className="h-6 w-6 text-white" /></div></div></div>)}
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-semibold">Riwayat & Catatan Persetujuan:</p><div className="space-y-4">
                                                                {request.pengajuan?.pengajuan_approval.map((p, index) => (
                                                                    <div key={index} className="flex items-start gap-3 text-sm">
                                                                        {p.status === 'Disetujui' && <CircleCheck className="h-5 w-5 text-green-500 mt-1 shrink-0" />}
                                                                        {p.status === 'Ditolak' && <CircleX className="h-5 w-5 text-red-500 mt-1 shrink-0" />}
                                                                        {p.status === 'Menunggu' && <Clock className="h-5 w-5 text-gray-400 mt-1 shrink-0" />}
                                                                        <div className='flex-1'><p className='font-medium'>{p.user?.username}
                                                                            <span className="text-xs text-muted-foreground">({p.tanggal_approval ? new Date(p.tanggal_approval).toLocaleDateString('id-ID', {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric',
                                                                            }) : " - "})</span>
                                                                        </p>{p.catatan ? (<p className='text-muted-foreground italic flex items-start gap-2 mt-1'>
                                                                            <MessageSquareQuote className='h-4 w-4 shrink-0 mt-0.5' /> &ldquo;{p.catatan}&rdquo;</p>
                                                                        ) : (
                                                                            <p className='text-muted-foreground italic text-xs'>- Tidak ada catatan -</p>)}
                                                                        </div>
                                                                    </div>))}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label htmlFor={`notes-${request.id}`} className="text-sm font-semibold">Catatan (Opsional)</label>
                                                            <Textarea id={`notes-${request.id}`} placeholder="Tambahkan catatan..." onChange={(e) => setNotes(e.target.value)} /></div>
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="destructive" size="sm" onClick={() => handleApprovalAction(request.pengajuan_id, 'Ditolak')}>
                                                                <CircleX className="mr-2 h-4 w-4" /> Tolak
                                                            </Button>
                                                            <Button size="sm" onClick={() => handleApprovalAction(request.pengajuan_id, 'Disetujui')}>
                                                                <CircleCheck className="mr-2 h-4 w-4" /> Setujui
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                ) : <p className="col-span-full text-center text-muted-foreground py-10">Tidak ada pengajuan yang perlu persetujuan Anda.</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                {isLoading && <Loading />}
            </div>

            <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="sr-only">Pratinjau Lampiran</DialogTitle>
                        <DialogDescription className="sr-only">Gambar lampiran bukti pengajuan.</DialogDescription>
                    </DialogHeader>
                    {imageToShow && (<div className="relative mt-4" style={{ paddingTop: '75%' }}><Image src={imageToShow} alt="Pratinjau Bukti" layout="fill" className="object-contain rounded-md" unoptimized /></div>)}
                </DialogContent>
            </Dialog>
        </>
    );
}