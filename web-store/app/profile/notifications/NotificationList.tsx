"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types";
import { Bell, CheckCheck, ExternalLink, Heart, Package, Percent, ShoppingCart, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface NotificationListProps {
    initialNotifications: Notification[];
}

export function NotificationList({ initialNotifications }: NotificationListProps) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const getIcon = (type: string, isRead: boolean) => {
        const iconClass = `w-6 h-6 ${isRead ? "text-muted-foreground" : "text-primary"}`;
        switch (type) {
            case "order": return <Package className={iconClass} />;
            case "promo": return <Percent className={iconClass} />;
            case "wallet": return <Wallet className={iconClass} />;
            case "cart": return <ShoppingCart className={iconClass} />;
            case "wishlist": return <Heart className={iconClass} />;
            case "system":
            default: return <Bell className={iconClass} />;
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await supabase.from("notifications").update({ is_read: true }).eq("id", id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        setIsLoading(true);
        try {
            await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success("Semua notifikasi ditandai sudah dibaca");
        } catch (error) {
            toast.error("Gagal menandai notifikasi");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border relative">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold relative">
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Notifikasi Pesan</h2>
                        <p className="text-sm text-muted-foreground font-medium">Informasi promo dan update pesanan.</p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <Button
                        disabled={isLoading}
                        onClick={markAllAsRead}
                        variant="outline"
                        className="rounded-full bg-white border-border text-muted-foreground hover:text-foreground hover:bg-muted font-bold h-10 px-4"
                    >
                        <CheckCheck className="w-4 h-4 mr-2" /> Tandai semua dibaca
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-muted/30 rounded-[24px] border border-dashed border-border text-center">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 bg-white rounded-[20px] shadow-sm border border-border flex items-center justify-center relative z-10">
                            <Bell className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/5 rounded-full z-0 blur-lg"></div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Belum ada notifikasi</h3>
                    <p className="text-muted-foreground font-medium max-w-sm">Kotak masuk Anda masih kosong. Kami akan memberi tahu Anda di sini jika ada update pesanan atau promo menarik.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                            className={`group relative p-5 rounded-[20px] border transition-all duration-300 cursor-pointer flex gap-5
                                ${notification.is_read ? 'bg-white border-border hover:border-gray-200' : 'bg-primary/5 border-primary/20 shadow-sm'}
                            `}
                        >
                            <div className="shrink-0 flex items-start pt-1">
                                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-colors
                                    ${notification.is_read ? 'bg-muted/50 border border-border' : 'bg-white border border-primary/20 shadow-sm'}
                                `}>
                                    {getIcon(notification.type, notification.is_read)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex items-start justify-between gap-4 mb-1.5">
                                    <h3 className={`text-[15px] font-bold truncate ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="shrink-0 text-[11px] font-medium text-muted-foreground mt-1 whitespace-nowrap">
                                        {formatDateTime(notification.created_at)}
                                    </span>
                                </div>
                                <p className={`text-sm line-clamp-2 ${notification.is_read ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                                    {notification.message}
                                </p>

                                {notification.action_url && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/90 w-fit" onClick={(e) => {
                                        // prevent marking as read from double triggering or navigating weirdly if its a link
                                        if (!notification.is_read) markAsRead(notification.id);
                                    }}>
                                        <Link href={notification.action_url} className="flex items-center gap-1.5 border-b border-transparent hover:border-primary transition-all">
                                            Lihat Detail <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {!notification.is_read && (
                                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-4 border-white"></div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
