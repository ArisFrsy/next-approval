// Sidebar.tsx / MenuList.tsx

"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
// 1. Impor tipe 'LucideIcon' untuk digunakan dalam definisi tipe data
import {
    FileText, LayoutGrid, HelpCircle, PanelLeft, ChevronRight,
    PlusSquare, ListChecks, ExternalLink, LayoutDashboard,
    ClipboardList, type LucideIcon, AlarmClockCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

// 2. Definisikan tipe untuk setiap item menu dan sub-menu
type SubMenuItem = {
    icon: LucideIcon;
    text: string;
    href: string;
};

type MenuItem = {
    icon?: LucideIcon; // Dibuat opsional untuk tipe 'separator'
    text?: string;
    href?: string;
    type?: 'separator';
    external?: boolean;
    subItems?: SubMenuItem[];
};

// 3. Terapkan tipe 'MenuItem[]' pada array data Anda
const menuItems: MenuItem[] = [
    { icon: LayoutGrid, text: "Dashboard", href: "/dashboard" },
    {
        icon: FileText,
        text: "Pengajuan",
        href: "/pengajuan",
        subItems: [
            { icon: PlusSquare, text: "Buat Pengajuan", href: "/pengajuan/tambah" },
            { icon: ListChecks, text: "Lacak Status", href: "/pengajuan/status" },
        ],
    },
    { icon: AlarmClockCheck, text: "Attendance V2", href: "/attendance/v2" },
    { icon: HelpCircle, text: "Bantuan", href: "/bantuan" },
    { type: 'separator' },
    {
        icon: LayoutDashboard,
        text: "Dashboard Otobos",
        href: "https://otobos.alfahuma.com/",
        external: true
    },
    {
        icon: ClipboardList,
        text: "Todo Report",
        href: "https://otobos.alfahuma.com/todo_report",
        external: true
    },
    {
        icon: AlarmClockCheck,
        text: 'Attendance',
        href: "https://otobos.alfahuma.com/attendance",
        external: true
    }
];

export function MenuList({ onLinkClick }: { onLinkClick?: () => void }) {
    const pathname = usePathname();

    return (
        <nav className="grid items-start gap-1 px-2">
            {menuItems.map((item, index) => {
                if (item.type === 'separator') {
                    return <Separator key={index} className="my-2" />;
                }

                if (item.external) {
                    return (
                        <a
                            href={item.href}
                            rel="noopener noreferrer"
                            key={index}
                            onClick={onLinkClick}
                            className="block"
                        >
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-base"
                            >
                                {item.icon && <item.icon className="h-5 w-5" />}
                                {item.text}
                                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                            </Button>
                        </a>
                    );
                }

                // Dengan tipe yang benar, TypeScript sekarang tahu 'item.icon' adalah komponen
                return item.subItems ? (
                    <Collapsible
                        key={index}
                        defaultOpen={pathname.startsWith(item.href ?? '')}
                        className="group"
                    >
                        <CollapsibleTrigger asChild>
                            <Button
                                variant={pathname.startsWith(item.href ?? '') ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 text-base"
                            >
                                {item.icon && <item.icon className="h-5 w-5" />}
                                {item.text}
                                <ChevronRight className="ml-auto h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="py-1 pl-8">
                            <div className="flex flex-col gap-1 border-l-2 pl-4">
                                {item.subItems.map((subItem, subIndex) => (
                                    <Link href={subItem.href} key={subIndex} onClick={onLinkClick}>
                                        <Button
                                            variant={pathname === subItem.href ? "secondary" : "ghost"}
                                            className="w-full justify-start gap-3 text-sm"
                                            size="sm"
                                        >
                                            <subItem.icon className="h-5 w-5" />
                                            {subItem.text}
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ) : (
                    <Link href={item.href ?? ''} key={index} onClick={onLinkClick}>
                        <Button
                            variant={pathname === item.href ? "secondary" : "ghost"}
                            className="w-full justify-start gap-3 text-base"
                        >
                            {item.icon && <item.icon className="h-5 w-5" />}
                            {item.text}
                        </Button>
                    </Link>
                );
            })}
        </nav>
    );
}


// Komponen Sidebar tidak perlu diubah
export default function Sidebar() {
    return (
        <aside className="hidden flex-col border-r bg-muted/40 md:flex">
            <div className="flex h-16 shrink-0 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <PanelLeft className="h-6 w-6 text-primary" />
                    <span>NEXT OTOBOS</span>
                </Link>
            </div>
            <div className="flex-1 py-4">
                <MenuList />
            </div>
        </aside>
    );
}