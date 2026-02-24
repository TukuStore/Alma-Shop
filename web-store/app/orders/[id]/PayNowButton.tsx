"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { markOrderAsPaid } from "./actions";

interface PayNowButtonProps {
    orderId: string;
}

export function PayNowButton({ orderId }: PayNowButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [paid, setPaid] = useState(false);
    const router = useRouter();

    const handlePay = () => {
        startTransition(async () => {
            const result = await markOrderAsPaid(orderId);
            if (result.error) {
                toast.error("Gagal memproses pembayaran", { description: result.error });
            } else {
                setPaid(true);
                toast.success("Pembayaran Berhasil! 🎉", {
                    description: "Status pesanan Anda telah diperbarui menjadi 'Terbayar'.",
                });
                router.refresh();
            }
        });
    };

    if (paid) {
        return (
            <div className="w-full h-11 rounded-lg bg-[#059669] text-white font-bold flex items-center justify-center gap-2 shadow-sm animate-in zoom-in duration-300">
                <CheckCircle2 className="w-5 h-5" /> Pembayaran Berhasil!
            </div>
        );
    }

    return (
        <Button
            onClick={handlePay}
            disabled={isPending}
            className="w-full h-11 rounded-lg bg-[#121926] hover:bg-black text-white font-bold shadow-sm transition-all active:scale-95"
        >
            {isPending ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...
                </>
            ) : (
                <>
                    Bayar Sekarang <ExternalLink className="w-4 h-4 ml-2" />
                </>
            )}
        </Button>
    );
}
