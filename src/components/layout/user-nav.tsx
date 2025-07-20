"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function UserNav() {
    const openToast = () => {
        // warning toast masih dalam pengembangan
        toast.error("Fitur ini masih dalam pengembangan. Silakan coba lagi nanti.");
    }

    const handleLogout = () => {
        // Implementasi logout di sini
        // delete from localStorage atau panggil API logout
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.success("Anda telah berhasil logout.");
        window.location.replace('https://otobos.alfahuma.com/login/logout');

    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>
                            <User className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openToast()}>Profil</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openToast()}>Pengaturan</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleLogout()}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}