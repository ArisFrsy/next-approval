// File: lib/confirm-dialog-context.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Types
export type ConfirmDialogOptions = {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
};

type ConfirmDialogContextType = {
    show: (options: ConfirmDialogOptions) => Promise<{ confirmed: boolean }>;
};

// Context setup
const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(null);

export const useConfirmDialog = () => {
    const context = useContext(ConfirmDialogContext);
    if (!context) throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
    return context;
};

// Singleton instance workaround
let dialogInstance: ConfirmDialogContextType;
export const setDialogInstance = (instance: ConfirmDialogContextType) => {
    dialogInstance = instance;
};
export const getDialogInstance = () => dialogInstance;

// Provider Component
export const ConfirmDialogProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmDialogOptions>({
        title: "",
        description: "",
        confirmText: "Yes",
        cancelText: "Cancel",
    });
    const [resolver, setResolver] = useState<(value: { confirmed: boolean }) => void>();

    const show = (opts: ConfirmDialogOptions) => {
        setOptions({
            ...opts,
            confirmText: opts.confirmText ?? "Yes",
            cancelText: opts.cancelText ?? "Cancel",
        });
        setOpen(true);
        return new Promise<{ confirmed: boolean }>((resolve) => {
            setResolver(() => resolve);
        });
    };

    const handleConfirm = () => {
        resolver?.({ confirmed: true });
        setOpen(false);
    };

    const handleCancel = () => {
        resolver?.({ confirmed: false });
        setOpen(false);
    };

    setDialogInstance({ show });

    return (
        <ConfirmDialogContext.Provider value={{ show }}>
            {children}
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{options.title}</AlertDialogTitle>
                        {options.description && (
                            <AlertDialogDescription>{options.description}</AlertDialogDescription>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>{options.cancelText}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>{options.confirmText}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ConfirmDialogContext.Provider>
    );
};
