"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Loader2, PackageCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { markOrderAsCompleted } from "./actions";

export function CompleteOrderButton({ orderId }: { orderId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            const result = await markOrderAsCompleted(orderId);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Berhasil mengkonfirmasi pesanan diterima.");
                setIsOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden mt-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#059669]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">Konfirmasi Penerimaan</h3>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-6 leading-relaxed">
                Klik tombol di bawah ini jika pesanan Anda telah sampai dengan selamat.
            </p>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        className="w-full h-11 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm rounded-lg shadow-sm transition-all duration-300"
                    >
                        Ya, Pesanan Selesai
                    </Button>
                </DialogTrigger>
                <DialogContent className="!max-w-[400px] !w-[90vw] rounded-2xl p-6">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-[#059669]/10 rounded-full flex items-center justify-center mb-4">
                            <PackageCheck className="w-6 h-6 text-[#059669]" />
                        </div>
                        <DialogTitle className="text-center text-xl font-bold text-gray-900">Konfirmasi Pesanan</DialogTitle>
                        <DialogDescription className="text-center pt-2 text-gray-500">
                            Apakah Anda yakin pesanan <strong className="text-gray-900">sudah diterima dengan baik dan sesuai</strong>? Tindakan ini tidak dapat dibatalkan dan menandakan transaksi telah selesai.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex bg-amber-50 p-3 rounded-xl border border-amber-200 mt-2">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mr-3" />
                        <p className="text-xs text-amber-700">
                            Pastikan Anda telah memeriksa kondisi barang sebelum mengkonfirmasi pesanan selesai.
                        </p>
                    </div>

                    <DialogFooter className="sm:justify-between flex-row gap-3 mt-6 sm:space-x-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isLoading}
                            className="flex-1 rounded-lg h-11 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold active:scale-95 transition-transform"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleComplete}
                            disabled={isLoading}
                            className="flex-1 rounded-lg h-11 bg-[#059669] hover:bg-[#047857] text-white font-bold active:scale-95 transition-transform"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Merespon...
                                </>
                            ) : (
                                "Ya, Selesai"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
