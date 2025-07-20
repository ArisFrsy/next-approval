// app/attendance/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, CheckCircle, XCircle, User, Clock, Building } from 'lucide-react';
import { getDistance } from '@/lib/utils';
import { ModernCamera } from '@/components/camera/ModernCamera';
import { AttendanceResponse } from '@/model/responses/attendanceResponse';
import { toast } from 'sonner';
import { fetchAttendance, postAttendance } from '@/lib/api/attendanceClient';
import { AttendanceRequest } from '@/model/requests/attendanceRequest';
import Loading from '@/components/layout/Spinner';

// Koordinat kantor dan jarak maksimal untuk absensi
const OFFICE_COORDINATES = {
    latitude: -7.970492,
    longitude: 112.643855,
};
const MAX_DISTANCE_METERS = 100;

export default function AttendancePage() {
    // --- STATE MANAGEMENT ---
    const [currentTime, setCurrentTime] = useState(new Date());
    const [distance, setDistance] = useState<number | null>(null);
    const [isWithinRange, setIsWithinRange] = useState(false);
    const [currentAddress, setCurrentAddress] = useState<string>('Mendeteksi lokasi...');
    const [showCamera, setShowCamera] = useState(false);
    const [isClockingIn, setIsClockingIn] = useState(true);
    const [attendanceIn, setAttendanceIn] = useState<AttendanceResponse | undefined>();
    const [attendanceOut, setAttendanceOut] = useState<AttendanceResponse | undefined>();
    const [user, setUser] = useState<{ id?: number; name?: string; position?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    // --- PERUBAHAN 1: Ganti useState dengan useRef untuk menandai toast ---
    const hasShownLocationWarningRef = useRef(false);

    // --- REFS ---
    const lastLocationRef = useRef<{ lat: number; lon: number } | null>(null);
    const lastRequestTimeRef = useRef<number>(0);

    // --- CONSTANTS ---
    const LOCATIONIQ_API_KEY = 'pk.8d31753982b4d8158b390b74219e9c93';

    // --- DATA FETCHING & SIDE EFFECTS ---
    useEffect(() => {
        // Ambil data user dari localStorage saat komponen dimuat di client
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
    }, []);

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const response = await fetchAttendance({ userId: user.id });
            const data = response.data;
            const todayIn = data.find(att => att.atd_tipe === 0);
            const todayOut = data.find(att => att.atd_tipe === 1);
            setAttendanceIn(todayIn);
            setAttendanceOut(todayOut);
            setIsLoading(false);
        } catch {
            toast.error('Gagal mengambil data riwayat absensi.');
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        const locationWatcher = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                lastLocationRef.current = { lat: latitude, lon: longitude };

                const dist = getDistance(latitude, longitude, OFFICE_COORDINATES.latitude, OFFICE_COORDINATES.longitude);
                const inRange = dist <= MAX_DISTANCE_METERS;
                setDistance(dist);
                setIsWithinRange(inRange);

                // --- PERUBAHAN 2: Gunakan ref untuk memeriksa & menampilkan toast ---
                // Cek kondisi menggunakan variabel lokal `inRange` dan nilai `ref` saat ini.
                if (!inRange && !hasShownLocationWarningRef.current) {
                    toast.warning('Anda berada di luar jangkauan untuk absensi.', {
                        description: `Jarak Anda: ${dist.toFixed(0)} meter. Jika tidak WFH, segera ke kantor.`,
                        duration: 10000 // Tampilkan lebih lama
                    });
                    // Setelah toast muncul, ubah nilai ref agar tidak muncul lagi.
                    hasShownLocationWarningRef.current = true;
                }

                const now = Date.now();
                if (now - lastRequestTimeRef.current > 15000) { // Throttle geocoding API call
                    lastRequestTimeRef.current = now;
                    try {
                        const res = await fetch(`https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`);
                        const data = await res.json();
                        setCurrentAddress(data.display_name || 'Alamat tidak ditemukan');
                    } catch {
                        setCurrentAddress('Gagal mengambil alamat');
                    }
                }
            },
            () => {
                toast.error("Izin lokasi ditolak.", { description: "Anda harus mengizinkan akses lokasi untuk melakukan absensi." });
                setCurrentAddress('Izin lokasi ditolak.');
                setIsWithinRange(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        return () => {
            clearInterval(timer);
            navigator.geolocation.clearWatch(locationWatcher);
        };
    }, [LOCATIONIQ_API_KEY]);

    // --- HANDLER FUNCTIONS ---
    const submitAttendance = async (file: File, wfhStatus: 0 | 1) => {
        if (!lastLocationRef.current) {
            toast.error("Lokasi tidak terdeteksi", { description: "Pastikan GPS Anda aktif dan coba lagi." });
            return;
        }

        setIsLoading(true);

        const request: AttendanceRequest = {
            atd_userid: user.id,
            atd_username: user.name,
            atd_check_time: currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            atd_address: currentAddress,
            file: file,
            atd_tipe: isClockingIn ? 0 : 1,
            atd_wfh: wfhStatus,
            atd_latitude: lastLocationRef.current.lat.toString(),
            atd_longitude: lastLocationRef.current.lon.toString(),
        };

        const toastId = toast.loading('Menyimpan data absensi...');
        try {
            const response = await postAttendance(request);
            if (response.success) {
                toast.success('Absensi berhasil disimpan!', { id: toastId });
                fetchData(); // Muat ulang riwayat setelah berhasil
                setIsLoading(false);
            } else {
                toast.error(response.message || 'Gagal menyimpan absensi', { id: toastId });
                setIsLoading(false);
            }
        } catch {
            toast.error('Terjadi kesalahan saat mengirim absensi', { id: toastId });
            setIsLoading(false);
        }
    };

    const handleCapture = (result: { imageFile: File; isWfh: 0 | 1; }) => {
        setShowCamera(false);
        submitAttendance(result.imageFile, result.isWfh);
    };

    const openCameraFor = (mode: 'in' | 'out') => {
        setIsClockingIn(mode === 'in');
        setShowCamera(true);
    };

    // --- CONDITIONAL RENDER ---
    if (showCamera) {
        return <ModernCamera onCapture={handleCapture} onClose={() => setShowCamera(false)} />;
    }

    // --- MAIN RENDER ---
    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Absensi Kehadiran</h2>
                    <p className="text-muted-foreground">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                    <div className="font-bold">{user.name || 'Nama Pengguna'}</div>
                    <div className="text-sm text-muted-foreground">{user.position || 'Pegawai'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <p className="text-center text-6xl font-bold tracking-tighter">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <div className="w-full max-w-md text-center rounded-lg border bg-card p-4">
                                <div className="flex items-center justify-center font-semibold"><Building className="mr-2 h-4 w-4" /> Kantor Malang</div>
                                <div className="flex items-center justify-center mt-2 text-center"><MapPin className="mr-2 h-4 w-4 shrink-0" /><span className="text-sm">{currentAddress}</span></div>
                                {distance !== null && (
                                    <div className={`flex items-center justify-center text-sm font-medium mt-2 ${isWithinRange ? 'text-green-500' : 'text-red-500'}`}>
                                        {isWithinRange ? <CheckCircle className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                                        <span>Jarak: {distance.toFixed(0)} meter. {isWithinRange ? 'Dalam jangkauan.' : 'Di luar jangkauan.'}</span>
                                    </div>
                                )}
                            </div>

                            {!attendanceIn ? (
                                <Button onClick={() => openCameraFor('in')} className="w-full max-w-md py-6 text-lg" >
                                    Clock In
                                </Button>
                            ) : !attendanceOut ? (
                                <Button onClick={() => openCameraFor('out')} variant="destructive" className="w-full max-w-md py-6 text-lg" >
                                    Clock Out
                                </Button>
                            ) : (
                                <p className="py-6 text-lg text-green-600 font-semibold">✅ Absensi hari ini telah selesai!</p>
                            )}
                            {!isWithinRange && distance !== null && <p className="text-red-500 text-xs mt-2">Anda harus berada dalam jangkauan untuk melakukan absensi.</p>}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center"><Clock className="mr-2 h-5 w-5" /> Riwayat Hari Ini</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                {/* --- PERUBAHAN DIMULAI DI SINI --- */}
                                {attendanceIn ? (
                                    <>
                                        {/* Grup untuk deskripsi dan label tambahan */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <CardDescription>Clock In</CardDescription>

                                            {attendanceIn.atd_check_time &&
                                                new Date(`1970-01-01T${attendanceIn.atd_check_time}Z`) > new Date("1970-01-01T08:00:00Z") &&
                                                attendanceIn.atd_wfh !== 1 && (
                                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                                                        {"Don't be late"}
                                                    </span>
                                                )}
                                        </div>

                                        {/* Konten detail absensi */}
                                        <div className="flex items-start space-x-4">
                                            <Avatar className="h-16 w-16 border">
                                                <AvatarImage src={attendanceIn.atd_photo_urls} />
                                                <AvatarFallback><User /></AvatarFallback>
                                            </Avatar>
                                            <div className="text-sm">
                                                <p className="font-bold text-lg">{attendanceIn.atd_check_time}</p>
                                                <p className="text-muted-foreground">{attendanceIn.atd_address}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <CardDescription>Clock In</CardDescription>
                                        <p className="text-sm text-muted-foreground mt-2">- Belum ada data -</p>
                                    </>
                                )}
                                {/* --- PERUBAHAN SELESAI DI SINI --- */}
                            </div>

                            <div>
                                <CardDescription>Clock Out</CardDescription>
                                {attendanceOut ? (
                                    <div className="flex items-start space-x-4 mt-2">
                                        <Avatar className="h-16 w-16 border">
                                            <AvatarImage src={attendanceOut.atd_photo_urls} />
                                            <AvatarFallback><User /></AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm">
                                            <p className="font-bold text-lg">{attendanceOut.atd_check_time}</p>
                                            <p className="text-muted-foreground">{attendanceOut.atd_address}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground mt-2">- Menunggu clock out -</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {isLoading && <Loading />}
        </div>
    );
}