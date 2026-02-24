"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("App Error Boundary caught:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6 text-destructive">
                <AlertCircle className="h-10 w-10" />
            </div>

            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Terjadi Kesalahan
            </h2>

            <p className="text-muted-foreground max-w-md mb-8">
                Maaf, sistem kami mengalami kendala saat memproses permintaan Anda. Hal ini sudah kami rekam untuk diperbaiki.
            </p>

            <Button onClick={() => reset()} size="lg" className="rounded-full px-6 flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                Coba Muat Ulang
            </Button>
        </div>
    );
}
