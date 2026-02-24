"use client";

import { Button } from "@/components/ui/button";
import { Loader2, MapPin, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddressFormModal } from "./AddressFormModal";
import { deleteAddress, setAsDefaultAddress } from "./actions";

export interface Address {
    id: string;
    label: string;
    recipient_name: string;
    phone_number: string;
    address_line: string;
    city: string;
    province: string;
    postal_code: string;
    is_default: boolean;
}

interface AddressListProps {
    initialAddresses: Address[];
}

export function AddressList({ initialAddresses }: AddressListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) return;

        setLoadingId(`delete-${id}`);
        try {
            const result = await deleteAddress(id);
            if (result.error) toast.error("Gagal", { description: result.error });
            else toast.success("Berhasil", { description: "Alamat telah dihapus." });
        } catch (e) {
            toast.error("Error", { description: "Gagal menghapus alamat." });
        } finally {
            setLoadingId(null);
        }
    };

    const handleSetDefault = async (id: string) => {
        setLoadingId(`default-${id}`);
        try {
            const result = await setAsDefaultAddress(id);
            if (result.error) toast.error("Gagal", { description: result.error });
            else toast.success("Berhasil", { description: "Alamat utama telah diubah." });
        } catch (e) {
            toast.error("Error", { description: "Gagal mengatur alamat utama." });
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="flex-1 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Daftar Alamat</h2>
                            <p className="text-sm text-muted-foreground font-medium">Kelola alamat pengiriman untuk kemudahan checkout.</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="hidden md:flex rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 px-6 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" /> Tambah Alamat
                    </Button>
                </div>

                {initialAddresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 bg-muted/30 rounded-[24px] border border-dashed border-border text-center">
                        <div className="w-20 h-20 bg-white rounded-[20px] flex items-center justify-center mb-6 shadow-sm border border-border">
                            <MapPin className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Belum ada alamat tersimpan</h3>
                        <p className="text-muted-foreground font-medium mb-8 max-w-sm">Anda belum menambahkan alamat pengiriman. Tambahkan alamat sekarang untuk mempercepat proses belanja selanjutnya.</p>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 px-8 shadow-sm transition-all active:scale-95"
                        >
                            Tambah Alamat Baru
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {initialAddresses.map((addr) => (
                            <div key={addr.id} className={`p-6 rounded-[24px] border transition-all ${addr.is_default ? 'border-primary/50 bg-primary/5' : 'border-border bg-white hover:border-gray-300'}`}>
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{addr.label}</span>
                                            {addr.is_default && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                                                    Utama
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground">{addr.recipient_name}</h3>
                                        <p className="text-foreground font-medium">{addr.phone_number}</p>
                                        <p className="text-muted-foreground font-medium max-w-xl">
                                            {addr.address_line}, {addr.city}, {addr.province}, {addr.postal_code}
                                        </p>
                                    </div>

                                    <div className="flex md:flex-col justify-end gap-2 md:w-48 shrink-0 border-t pt-4 md:border-t-0 md:pt-0">
                                        {!addr.is_default && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSetDefault(addr.id)}
                                                disabled={loadingId === `default-${addr.id}`}
                                                className="w-full h-10 rounded-full font-bold border-border text-foreground hover:bg-muted"
                                            >
                                                {loadingId === `default-${addr.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Jadikan Utama'}
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(addr.id)}
                                            disabled={loadingId === `delete-${addr.id}`}
                                            className="w-full h-10 rounded-full font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            {loadingId === `delete-${addr.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-2" /> Hapus</>}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button
                            onClick={() => setIsModalOpen(true)}
                            variant="outline"
                            className="w-full mt-4 flex md:hidden rounded-full font-bold h-12 border-dashed border-2 border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" /> Tambah Alamat Lain
                        </Button>
                    </div>
                )}
            </div>

            <AddressFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
