'use client'; // Diperlukan karena menggunakan hooks (useState, useEffect)

import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress"; // Pastikan path ini sesuai

function Loading() {
    // State untuk menyimpan nilai progress, dimulai dari 0
    const [progress, setProgress] = useState(0);

    // useEffect untuk menjalankan interval saat komponen dimuat
    useEffect(() => {
        // Set interval untuk mengupdate progress
        const timer = setInterval(() => {
            setProgress((prevProgress) => {
                // Jika progress sudah 100 atau lebih, kembalikan ke 0 untuk looping
                if (prevProgress >= 100) return 0;
                // Tambah progress
                return prevProgress + 5;
            });
        }, 100); // Anda bisa menyesuaikan kecepatan di sini (ms)

        // Cleanup function: Hentikan interval saat komponen di-unmount
        return () => {
            clearInterval(timer);
        };
    }, []); // Efek ini hanya berjalan sekali saat komponen mount

    return (
        // Container untuk progress bar yang menempel di atas layar
        // h-1 membuatnya tipis, sesuaikan jika perlu
        <div className="fixed top-0 left-0 w-full h-1 z-50">
            {/* * Komponen Progress dari shadcn/ui.
              * className di sini akan menimpa/menambah gaya default.
              * Kita hapus background track default dan hanya mewarnai indikatornya.
              * Untuk membuat indikator berwarna hijau, kita bisa menambahkan kelas bg-green-500.
              * Namun, cara terbaik di shadcn/ui adalah dengan memodifikasi komponen Progress itu sendiri atau menggunakan CSS-in-JS.
              * Jika `className` tidak langsung mewarnai, Anda mungkin perlu mengedit file `components/ui/progress.jsx`
              * dan mengubah `ProgressPrimitive.Indicator` untuk menerima warna dari props atau menggunakan `style`.
              * * Untuk Tailwind, Anda perlu memastikan kelas warna (seperti `bg-green-500`) tidak di-purge.
              * Biasanya, komponen Progress dari shadcn/ui menggunakan warna `primary` dari tema Anda.
              *
              * Pendekatan paling sederhana adalah dengan inline style jika className tidak bekerja:
              * <Progress value={progress} style={{ backgroundColor: 'green' }} />
              *
              * Atau dengan menambahkan `className` untuk menargetkan elemen di dalamnya:
            */}
            <Progress value={progress} className="w-full h-full [&>div]:bg-zinc-800" />
        </div>
    );
}

export default Loading;