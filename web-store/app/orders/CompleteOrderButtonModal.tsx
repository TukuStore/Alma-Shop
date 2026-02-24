'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { markOrderAsCompleted } from "../api/orders/actions";

interface Props {
    orderId: string;
}

export function CompleteOrderButtonModal({ orderId }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            const res = await markOrderAsCompleted(orderId);
            if (res.success) {
                toast.success("Pesanan telah diselesaikan!", {
                    description: "Terima kasih telah berbelanja. Anda sekarang bisa memberikan ulasan untuk produk.",
                });
                setIsOpen(false);
            } else {
                toast.error("Gagal", {
                    description: res.error || "Gagal menyelesaikan pesanan",
                });
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    style={{ backgroundColor: '#059669', color: '#ffffff' }}
                    className="w-full sm:w-auto px-5 py-2 text-sm font-semibold rounded-lg shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Pesanan Selesai
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Konfirmasi Pesanan Selesai</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin pesanan sudah diterima dalam kondisi baik dan sesuai?
                        <br /><br />
                        <strong className="text-red-500 font-medium">Perhatian:</strong> Setelah pesanan diselesaikan, Anda <strong>tidak bisa</strong> lagi mengajukan komplain/pengembalian barang.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleComplete}
                        disabled={isSubmitting}
                        style={{ backgroundColor: '#059669', color: '#ffffff' }}
                        className="w-full sm:w-auto shadow-md transition-opacity hover:opacity-90"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            "Ya, Pesanan Selesai"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
