// app/pengajuan/[kategoriId]/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, X, ArrowLeft, ArrowRight, Send, Check, ChevronsUpDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import komponen UI, termasuk Command
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { UserResponse } from "@/model/responses/userResponse";
import { fetchUsers } from "@/lib/api/userClient";
import { decrypt } from "@/lib/Encrypt";
import { postPengajuan } from "@/lib/api/pengajuanClient";
import { confirmDialog } from "@/lib/confirm-dialog";
import Loading from "@/components/layout/Spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TiptapEditor from "@/components/Editor";

const formSchema = z.object({
    atasanId: z.string({ required_error: "Atasan langsung harus dipilih." }),
    tanggalMulai: z.date({ required_error: "Tanggal mulai harus diisi." }),
    jamMulai: z.string({ required_error: "Jam mulai harus diisi." }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam tidak valid."),
    tanggalSelesai: z.date({ required_error: "Tanggal selesai harus diisi." }),
    jamSelesai: z.string({ required_error: "Jam selesai harus diisi." }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam tidak valid."),
    alasan: z.string().min(10, { message: "Alasan harus diisi, minimal 10 karakter." }),
    approvers: z.array(z.object({ userId: z.string().nonempty({ message: "Approver harus dipilih." }) })).min(1, { message: "Pilih minimal satu approver." }),
    bukti: z.any().optional(),
}).superRefine((data, ctx) => {
    if (data.tanggalMulai && data.tanggalSelesai && data.jamMulai && data.jamSelesai) {
        const startDateTime = new Date(data.tanggalMulai);
        const [startHour, startMinute] = data.jamMulai.split(':');
        startDateTime.setHours(parseInt(startHour), parseInt(startMinute));
        const endDateTime = new Date(data.tanggalSelesai);
        const [endHour, endMinute] = data.jamSelesai.split(':');
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute));
        if (endDateTime <= startDateTime) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Waktu selesai harus setelah waktu mulai", path: ["jamSelesai"] });
        }
    }
});

const steps = [
    { id: 1, name: 'Detail Waktu Pengajuan', fields: ['tanggalMulai', 'jamMulai', 'tanggalSelesai', 'jamSelesai'] },
    { id: 2, name: 'Informasi & Dokumen Pendukung', fields: ['atasanId', 'alasan', 'bukti'] },
    { id: 3, name: 'Alur Persetujuan (Approver)', fields: ['approvers'] },
    { id: 4, name: 'Konfirmasi Akhir' }
];

export default function PengajuanFormPage({ params }: { params: Promise<{ kategoriId: string, kategoriName: string }> }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const { kategoriId, kategoriName } = React.use(params);
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const kategoriIdDecrypted = decrypt(kategoriId);
    const kategoriNameDecrypted = decodeURIComponent(decrypt(kategoriName));
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    // ## PERUBAHAN: State untuk preview gambar ##
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    const [content, setContent] = useState<string>("");


    useEffect(() => {
        setIsLoading(true);
        fetchUsers({ page: 1, perPage: 1000, orderByDirection: "desc" })
            .then((data) => {
                setUsers(data.data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        // ## PERBAIKAN DI SINI ##
        // Inisialisasi semua field agar menjadi "controlled component" dari awal.
        defaultValues: {
            atasanId: "",
            tanggalMulai: undefined, // undefined tidak masalah untuk DatePicker
            jamMulai: "",
            tanggalSelesai: undefined,
            jamSelesai: "",
            alasan: "",
            approvers: [{ userId: "" }],
            bukti: undefined
        },
    });

    useEffect(() => {
        form.setValue('alasan', content, { shouldValidate: true, shouldDirty: true });
    }, [content, form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "approvers",
    });

    type FieldName = keyof z.infer<typeof formSchema>;

    const next = async () => {
        const fieldsToValidate = steps[currentStep].fields;
        const output = await form.trigger(fieldsToValidate as FieldName[], { shouldFocus: true });
        if (!output) return;
        if (currentStep < steps.length - 1) {
            setCurrentStep(step => step + 1);
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setCurrentStep(step => step - 1);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {

            const confirm = await confirmDialog({
                title: 'Konfirmasi',
                description: 'Apakah Anda yakin data pengajuan sudah benar ?',
                confirmText: 'Ya, Benar',
                cancelText: 'Batal',
            });

            if (!confirm.confirmed) {
                return; // User cancelled the operation
            }

            setIsLoading(true);

            const tanggalMulaiDateTime = new Date(values.tanggalMulai);
            const [mulaiJam, mulaiMenit] = values.jamMulai.split(":");
            tanggalMulaiDateTime.setHours(Number(mulaiJam), Number(mulaiMenit));

            const tanggalSelesaiDateTime = new Date(values.tanggalSelesai);
            const [selesaiJam, selesaiMenit] = values.jamSelesai.split(":");
            tanggalSelesaiDateTime.setHours(Number(selesaiJam), Number(selesaiMenit));

            const response = await postPengajuan({
                pegawai_id: user.id,
                kategori_id: Number(kategoriIdDecrypted),
                nama_atasan_id: values.atasanId ? Number(values.atasanId) : 0,
                tanggal_mulai: tanggalMulaiDateTime.toISOString(),
                jam_mulai: tanggalMulaiDateTime.toISOString(),
                tanggal_selesai: tanggalSelesaiDateTime.toISOString(),
                jam_selesai: tanggalSelesaiDateTime.toISOString(),
                alasan: content,
                bukti_file_raw: values.bukti,
                bukti_file: values.bukti,
                list_approval: values.approvers.map((approver, index) => ({
                    approver_id: Number(approver.userId),
                    role: "Approver",
                    urutan: index + 1,
                })),
            });

            setIsLoading(false);

            router.push('/pengajuan/status');
            console.log("Sukses:", response);
        } catch (err) {

            setIsLoading(false);
            console.error("Gagal:", err);
        }
    };


    useEffect(() => {
        console.log("Current Step:", currentStep);
    }, [currentStep])


    // ## PERUBAHAN: Tonton perubahan pada field 'bukti' ##
    const buktiFile = form.watch('bukti');
    useEffect(() => {
        if (buktiFile && buktiFile.length > 0) {
            const file = buktiFile[0];
            if (file instanceof File) {
                const newUrl = URL.createObjectURL(file);
                setPreviewUrl(newUrl);
                // Cleanup function untuk mencegah memory leak
                return () => URL.revokeObjectURL(newUrl);
            }
        } else {
            setPreviewUrl(null);
        }
    }, [buktiFile]);

    // ... sisa kode JSX tidak ada perubahan ...
    return (
        <div className="container mx-auto max-w-3xl p-4 md:p-8">
            {/* Header dan Progress Bar */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Form Pengajuan Izin {kategoriNameDecrypted}</h1>
                <p className="text-muted-foreground mt-2">Langkah {steps[currentStep].id}: {steps[currentStep].name}</p>
                <Progress value={((currentStep + 1) / steps.length) * 100} className="mt-4" />
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Konten Form yang Dinamis */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -30, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Langkah 1: Waktu */}
                            {currentStep === 0 && (
                                <div className="space-y-8">
                                    <h2 className="text-xl font-semibold">Kapan Anda akan izin?</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                        <div className="space-y-2">
                                            <FormLabel>Waktu Mulai</FormLabel>
                                            <div className="flex items-start gap-2">
                                                <FormField name="tanggalMulai" control={form.control} render={({ field }) => (<FormItem className="flex-1"> <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                                <FormField name="jamMulai" control={form.control} render={({ field }) => (<FormItem><FormControl><Input type="time" className="w-32" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <FormLabel>Waktu Selesai</FormLabel>
                                            <div className="flex items-start gap-2">
                                                <FormField name="tanggalSelesai" control={form.control} render={({ field }) => (<FormItem className="flex-1"> <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                                <FormField name="jamSelesai" control={form.control} render={({ field }) => (<FormItem><FormControl><Input type="time" className="w-32" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Langkah 2: Informasi */}
                            {currentStep === 1 && (
                                <div className="space-y-8">
                                    <h2 className="text-xl font-semibold">Apa alasan pengajuan Anda?</h2>

                                    <FormField
                                        control={form.control}
                                        name="atasanId"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Atasan Langsung</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                            >
                                                                {/* Tambahkan span ini juga di sini */}
                                                                <span className="truncate">
                                                                    {field.value
                                                                        ? users.find((user) => String(user.id) === field.value)?.username
                                                                        : "Pilih atasan"}
                                                                </span>
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                        <Command>
                                                            <CommandInput placeholder="Cari nama atasan..." />
                                                            <CommandEmpty>User tidak ditemukan.</CommandEmpty>
                                                            <CommandGroup className="max-h-[250px] overflow-y-auto">
                                                                {users.map((user) => (
                                                                    <CommandItem
                                                                        value={user.username}
                                                                        key={user.id}
                                                                        onSelect={() => {
                                                                            form.setValue("atasanId", String(user.id))
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", String(user.id) === field.value ? "opacity-100" : "opacity-0")} />
                                                                        <span className="truncate">{user.username}</span>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="alasan"
                                        control={form.control}
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Alasan Pengajuan</FormLabel>
                                                <FormControl>
                                                    <div className="prose max-w-none rounded-md border border-input min-h-[50px] p-4 overflow-hidden break-words">
                                                        <TiptapEditor value={content} onChange={setContent} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>)} />
                                    <FormField name="bukti" control={form.control} render={() => (<FormItem> <FormLabel>Lampiran / Bukti</FormLabel> <FormControl><Input type="file" accept="image/*" {...form.register('bukti')} /></FormControl><FormDescription>Opsional. Contoh: Surat dokter, undangan, dll.</FormDescription></FormItem>)} />
                                </div>
                            )}

                            {/* Langkah 3: Approver */}
                            {currentStep === 2 && (
                                <div className="space-y-8">
                                    <h2 className="text-xl font-semibold">Siapa saja yang perlu menyetujui?</h2>
                                    <div>
                                        <FormLabel>Alur Persetujuan (Berurutan)</FormLabel>
                                        <div className="space-y-4 mt-2">
                                            {fields.map((item, index) => (
                                                // Mengatur layout: vertikal di mobile, horizontal di web
                                                <div key={item.id} className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                                                    <p className="font-medium text-sm md:w-24">Approver {index + 1}</p>

                                                    <div className="flex w-full items-start gap-2">
                                                        <FormField
                                                            control={form.control}
                                                            name={`approvers.${index}.userId`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex-1">
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <FormControl>
                                                                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                                                    {/* Solusi stabil untuk teks yang bisa terpotong */}
                                                                                    <span className="block md:hidden truncate max-w-[20ch]">
                                                                                        {field.value ? users.find((user) => String(user.id) === field.value)?.username : "Pilih approver"}
                                                                                    </span>
                                                                                    <span className="hidden md:block">
                                                                                        {field.value ? users.find((user) => String(user.id) === field.value)?.username : "Pilih approver"}
                                                                                    </span>
                                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                </Button>
                                                                            </FormControl>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                                            <Command>
                                                                                <CommandInput placeholder="Cari nama approver..." />
                                                                                <CommandEmpty>User tidak ditemukan.</CommandEmpty>
                                                                                <CommandGroup className="max-h-[250px] overflow-y-auto">
                                                                                    {users
                                                                                        .filter(user => !form.watch('approvers').map(a => a.userId).includes(String(user.id)) || field.value === String(user.id))
                                                                                        .map((user) => (
                                                                                            <CommandItem
                                                                                                value={user.username}
                                                                                                key={user.id}
                                                                                                onSelect={() => {
                                                                                                    form.setValue(`approvers.${index}.userId`, String(user.id))
                                                                                                }}
                                                                                            >
                                                                                                <Check className={cn("mr-2 h-4 w-4", String(user.id) === field.value ? "opacity-100" : "opacity-0")} />
                                                                                                <span className="truncate">{user.username}</span>
                                                                                            </CommandItem>
                                                                                        ))}
                                                                                </CommandGroup>
                                                                            </Command>
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}><X className="h-4 w-4" /></Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ userId: "" })}><PlusCircle className="mr-2 h-4 w-4" />Tambah Approver</Button>
                                    </div>
                                </div>
                            )}

                            {/* Langkah 4: Konfirmasi */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold">Konfirmasi Data Pengajuan</h2>
                                    <div className="space-y-3 text-sm border p-4 rounded-lg bg-muted/30">
                                        <div className="flex justify-between"><span><strong>Atasan:</strong></span> <span>{users.find(u => u.id === parseInt(form.getValues('atasanId')))?.username || '-'}</span></div>
                                        <div className="flex justify-between"><span><strong>Waktu Mulai:</strong></span> <span>{format(form.getValues('tanggalMulai'), 'PPP')} - {form.getValues('jamMulai')}</span></div>
                                        <div className="flex justify-between"><span><strong>Waktu Selesai:</strong></span> <span>{format(form.getValues('tanggalSelesai'), 'PPP')} - {form.getValues('jamSelesai')}</span></div>
                                        <div><p><strong>Alasan:</strong></p><p
                                            className="text-muted-foreground"
                                            dangerouslySetInnerHTML={{ __html: form.getValues('alasan') }}
                                        />
                                        </div>
                                        <div><p><strong>Alur Persetujuan:</strong></p>
                                            <ol className="list-decimal list-inside text-muted-foreground">
                                                {form.getValues('approvers').map(a => (
                                                    <li key={a.userId}>{users.find(u => String(u.id) === a.userId)?.username || 'N/A'}</li>
                                                ))}
                                            </ol>
                                        </div>
                                        {/* ## PERUBAHAN: Tampilkan preview bukti ## */}
                                        <div>
                                            <p><strong>Bukti / Lampiran:</strong></p>
                                            {previewUrl ? (
                                                <div className="mt-2">
                                                    <div
                                                        onClick={() => setIsImagePreviewOpen(true)}
                                                        className="relative w-32 h-32 rounded-md overflow-hidden cursor-pointer group"
                                                    >
                                                        <Image
                                                            src={previewUrl}
                                                            alt="Bukti"
                                                            width={800} // atau sesuaikan
                                                            height={600} // atau sesuaikan
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Eye className="h-8 w-8 text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground">Tidak ada bukti yang dilampirkan.</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground">Pastikan semua data yang Anda masukkan sudah benar sebelum mengirim.</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Tombol Navigasi */}
                    <div className="mt-10 pt-6 border-t flex justify-between">
                        <Button
                            onClick={prev}
                            variant="outline"
                            type="button"  // Pastikan ini ada
                            disabled={currentStep === 0}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                        </Button>

                        {currentStep < steps.length - 1 ? (
                            <Button onClick={next} type="button">
                                Lanjut <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={form.handleSubmit(onSubmit)} type="button">
                                Kirim Pengajuan <Send className="ml-2 h-4 w-4" />
                            </Button>
                        )}

                    </div>
                </form>
            </Form>
            {/* ## PERUBAHAN: Dialog untuk zoom gambar ## */}
            <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        {/* Judul ini disembunyikan secara visual, tapi penting untuk screen reader */}
                        <DialogTitle className="sr-only">Pratinjau Lampiran</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full aspect-video bg-white">
                        <Image
                            src={previewUrl || ""}
                            alt="Bukti"
                            fill
                            className="object-contain"
                        />
                    </div>
                </DialogContent>
            </Dialog>
            {isLoading && <Loading />}
        </div>
    );
}