// app/providers.tsx
'use client';

import { ConfirmDialogProvider } from "@/lib/confirm-dialog-context";

export function Providers({ children }: { children: React.ReactNode }) {
    return <ConfirmDialogProvider>{children}</ConfirmDialogProvider>;
}
