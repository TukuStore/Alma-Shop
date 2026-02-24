"use client";

import { AddressFormModal } from "@/app/profile/addresses/AddressFormModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Address } from "@/types";
import { CheckCircle2, MapPin, Plus } from "lucide-react";
import { useState } from "react";

interface CheckoutAddressSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    addresses: Address[];
    selectedId: string | undefined;
    onSelect: (id: string, address: Address) => void;
}

export function CheckoutAddressSelector({ isOpen, onClose, addresses, selectedId, onSelect }: CheckoutAddressSelectorProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md md:max-w-2xl w-full rounded-[24px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold font-display text-foreground">Pilih Alamat Pengiriman</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Pilih alamat kemana pesanan Anda akan dikirimkan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        {addresses.map((addr) => (
                            <div
                                key={addr.id}
                                onClick={() => {
                                    onSelect(addr.id, addr);
                                    onClose();
                                }}
                                className={`relative p-5 rounded-[20px] border-2 cursor-pointer transition-all ${selectedId === addr.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-white hover:border-gray-300'}`}
                            >
                                {/* Decorative Top Right Triangle for Default/Selected */}
                                {addr.is_default && (
                                    <div className="absolute top-0 right-0 overflow-hidden text-right">
                                        <div className="w-0 h-0 border-t-[80px] border-l-[80px] border-t-primary border-l-transparent rounded-tr-[17px]"></div>
                                        <span className="absolute top-3 right-0.5 text-white text-[11px] font-bold tracking-widest uppercase rotate-45 transform origin-top-right whitespace-nowrap group-hover:scale-105 transition-transform">
                                            Default
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedId === addr.id ? 'bg-white border-primary border-2 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        {selectedId === addr.id && (
                                            <div className="absolute -top-1 -right-1 bg-white rounded-full">
                                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="pr-12">
                                        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                            {addr.label}
                                        </h3>
                                        <p className="font-semibold text-foreground mt-2">{addr.recipient_name} <span className="text-muted-foreground font-normal ml-2">{addr.phone_number}</span></p>
                                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                            {addr.address_line}, {addr.city}, {addr.province}, {addr.postal_code}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button
                            variant="outline"
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full h-14 rounded-[20px] border-dashed border-2 border-border text-foreground hover:bg-muted font-bold transition-all"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Tambah Alamat Baru
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AddressFormModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </>
    );
}
