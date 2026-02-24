"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { addAddress } from "./actions";

interface AddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddressFormModal({ isOpen, onClose }: AddressFormModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorData, setErrorData] = useState<string | null>(null);

    async function onSubmit(formData: FormData) {
        setIsLoading(true);
        setErrorData(null);

        try {
            const result = await addAddress(formData);

            if (result?.error) {
                setErrorData(result.error);
                toast.error("Gagal", { description: result.error });
            } else {
                toast.success("Berhasil", { description: "Alamat telah berhasil ditambahkan." });
                onClose();
            }
        } catch (e) {
            toast.error("Error", { description: "Terjadi kesalahan server." });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md md:max-w-xl w-full rounded-[24px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold font-display text-foreground">Tambah Alamat Baru</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Tambahkan alamat pengiriman baru ke akun Anda untuk mempermudah checkout.
                    </DialogDescription>
                </DialogHeader>

                {errorData && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-[12px] flex items-start gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{errorData}</p>
                    </div>
                )}

                <form action={onSubmit} className="space-y-4 pt-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 group">
                                <Label htmlFor="label" className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-focus-within:text-primary transition-colors">
                                    Label Alamat
                                </Label>
                                <Input
                                    id="label"
                                    name="label"
                                    placeholder="Contoh: Rumah, Kantor"
                                    required
                                    className="h-12 rounded-[12px] bg-muted/30 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <Label htmlFor="recipient_name" className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-focus-within:text-primary transition-colors">
                                    Nama Penerima
                                </Label>
                                <Input
                                    id="recipient_name"
                                    name="recipient_name"
                                    placeholder="Nama Lengkap"
                                    required
                                    className="h-12 rounded-[12px] bg-muted/30 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <Label htmlFor="phone_number" className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-focus-within:text-primary transition-colors">
                                Nomor Handphone
                            </Label>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                placeholder="08xxxxxxxx"
                                required
                                className="h-12 rounded-[12px] bg-muted/30 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>

                        <div className="space-y-2 group">
                            <Label htmlFor="address_line" className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-focus-within:text-primary transition-colors">
                                Alamat Lengkap
                            </Label>
                            <Input
                                id="address_line"
                                name="address_line"
                                placeholder="Nama Jalan, Gedung, No. Rumah"
                                required
                                className="h-12 rounded-[12px] bg-muted/30 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 group">
                                <Label htmlFor="city" className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-focus-within:text-primary transition-colors">
                                    Kota/Kabupaten
                                </Label>
                                <Input
                                    id="city"
                                    name="city"
                                    placeholder="Kota"
                                    required
                                    className="h-12 rounded-[12px] bg-muted/30 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <Label htmlFor="province" className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-focus-within:text-primary transition-colors">
                                    Provinsi
                                </Label>
                                <Input
                                    id="province"
                                    name="province"
                                    placeholder="Provinsi"
                                    required
                                    className="h-12 rounded-[12px] bg-muted/30 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <Label htmlFor="postal_code" className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-focus-within:text-primary transition-colors">
                                Kode Pos
                            </Label>
                            <Input
                                id="postal_code"
                                name="postal_code"
                                placeholder="Kode Pos"
                                required
                                className="h-12 rounded-[12px] bg-muted/30 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>

                        <div className="flex items-center space-x-3 pt-2">
                            <Checkbox id="is_default" name="is_default" value="true" className="w-5 h-5 rounded-md border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                            <Label htmlFor="is_default" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground">
                                Jadikan sebagai alamat utama
                            </Label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 h-12 rounded-full font-bold border-border text-foreground hover:bg-muted transition-all"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Alamat"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
