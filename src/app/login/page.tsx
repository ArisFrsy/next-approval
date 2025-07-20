"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loading from "@/components/layout/Spinner";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        setIsLoading(true);
        setMessage("Silahkan login melalui otobos."); // Bersihkan pesan sebelumnya

        // try {
        //     const response = await fetch("/next/api/login", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify({ username }),
        //     });

        //     const data = await response.json();

        //     if (!response.ok) {
        //         // Jika response dari server tidak OK (misal: status 400, 500)
        //         throw new Error(data.error || "Gagal untuk login.");
        //     }

        //     // Jika berhasil
        //     setMessage(data.message);
        //     // Di aplikasi nyata, Anda mungkin akan melakukan redirect:
        //     localStorage.setItem("token", data.token); // Simpan token ke localStorage
        //     localStorage.setItem("user", JSON.stringify(data.user));
        //     router.push('/dashboard');

        // } catch {
        //     setMessage("Terjadi kesalahan saat mencoba login. Pastikan username benar dan coba lagi.");
        // } finally {
        //     setIsLoading(false);
        // }

        setIsLoading(false);
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Masukkan username Anda untuk melanjutkan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="contoh: admin"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} // Tambahkan ini untuk submit dengan Enter
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                    <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
                        {isLoading ? "Memuat..." : "Masuk"}
                    </Button>
                    {message && (
                        <p className="mt-4 text-sm text-center w-full text-red-500 dark:text-red-400">
                            {message}
                        </p>
                    )}
                </CardFooter>
            </Card>
            {isLoading && <Loading />} {/* Tampilkan spinner saat loading */}
        </main>
    );
}