"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, Truck } from "lucide-react";
import { useState } from "react";

interface TrackingInfoCardProps {
    courier: string;
    trackingNumber: string;
}

function getTrackingUrl(trackingNumber: string): string {
    if (trackingNumber.startsWith("http://") || trackingNumber.startsWith("https://")) {
        return trackingNumber;
    }
    return `https://cekresi.com/?noresi=${encodeURIComponent(trackingNumber)}`;
}

export function TrackingInfoCard({ courier, trackingNumber }: TrackingInfoCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(trackingNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const trackingUrl = getTrackingUrl(trackingNumber);
    const isLiveLink = trackingNumber.startsWith("http");

    return (
        <div className="bg-white rounded-[28px] p-7 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-emerald-100 relative overflow-hidden animate-in slide-in-from-bottom-6 duration-500 mb-6 group hover:border-emerald-200 transition-colors">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full -z-0"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Truck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Informasi Pengiriman</h3>
                        <p className="text-sm text-gray-500 font-medium">
                            Dikirim dengan <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{courier}</span>
                        </p>
                    </div>
                </div>

                {/* Resi */}
                <div className="bg-gray-50/80 rounded-[20px] p-5 border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            {isLiveLink ? "Link Tracking" : "No. Resi"}
                        </p>
                        <p className="text-base font-mono font-bold text-gray-900 truncate">
                            {trackingNumber}
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="rounded-[12px] h-10 px-4 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white bg-white hover:border-gray-300 transition-all font-semibold active:scale-95"
                        >
                            {copied ? (
                                <><Check className="w-4 h-4 mr-2 text-emerald-500" />Tersalin</>
                            ) : (
                                <><Copy className="w-4 h-4 mr-2" />Salin</>
                            )}
                        </Button>
                        <a
                            href={trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-[12px] h-10 px-5 text-white font-bold transition-all active:scale-95 text-sm shrink-0 bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
                        >
                            Lacak Paket <ExternalLink className="w-4 h-4 ml-2 text-white" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
