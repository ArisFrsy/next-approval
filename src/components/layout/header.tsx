"use client";

import { useState } from "react"; // Import useState
import { Menu, PanelLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { MenuList } from "./sidebar";
import { UserNav } from "./user-nav";

export default function Header() {
    // State untuk mengontrol buka/tutup Sheet
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="md:hidden">
                {/* Buat Sheet menjadi controlled component */}
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Buka Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-4">
                        <SheetHeader className="mb-4 text-left">
                            <SheetTitle className="flex items-center gap-2">
                                <PanelLeft className="h-6 w-6 text-primary" />
                                <span className="text-lg">NEXT OTOBOS</span>
                            </SheetTitle>
                        </SheetHeader>
                        {/* Berikan fungsi untuk menutup sheet saat link diklik */}
                        <MenuList onLinkClick={() => setIsSheetOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="hidden flex-1 md:block"></div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifikasi</span>
                </Button>
                <UserNav />
            </div>
        </header>
    );
}