import { createClient } from "@/lib/supabase/server";
import { Bell, Briefcase, ChevronRight, MapPin, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AddressList } from "./AddressList";

export default async function AddressesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: addresses } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

    const fullName = user.user_metadata?.full_name || "Pengguna Alma";
    const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header Banner */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <div className="absolute inset-0 bg-primary/90"></div>
                <div className="absolute -top-20 -left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute top-10 -right-20 w-80 h-80 bg-black/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative -mt-32">

                {/* Profile Avatar Bar */}
                <div className="bg-white rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center shadow-max border border-border mb-8 animate-in slide-in-from-bottom-6 duration-500">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[24px] bg-primary flex items-center justify-center text-primary-foreground text-3xl md:text-5xl font-display font-extrabold shadow-lg shadow-primary/20 border-4 border-white transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                {initials}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm" title="Online"></div>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-display font-bold tracking-tight">{fullName}</h1>
                            <p className="text-muted-foreground font-medium text-sm md:text-base mb-1">{user.email}</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mt-2">
                                Member Aktif
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <div className="w-full lg:w-72 shrink-0">
                        <div className="bg-white rounded-[24px] p-4 shadow-xl shadow-black/5 border border-border flex flex-col gap-2 sticky top-24 animate-in slide-in-from-left-8 duration-700">
                            <Link href="/profile" className="flex items-center justify-between p-4 rounded-[16px] text-muted-foreground font-bold border border-transparent hover:bg-muted hover:text-foreground transition-colors group">
                                <span className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-muted-foreground group-hover:text-foreground bg-muted group-hover:bg-background p-1 rounded-md transition-colors" /> Informasi Utama
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                            </Link>

                            <Link href="/orders" className="flex items-center justify-between p-4 rounded-[16px] text-muted-foreground font-bold border border-transparent hover:bg-muted hover:text-foreground transition-colors group">
                                <span className="flex items-center gap-3">
                                    <Briefcase className="w-5 h-5 text-muted-foreground group-hover:text-foreground bg-muted group-hover:bg-background p-1 rounded-md transition-colors" /> Riwayat Transaksi
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                            </Link>

                            <Link href="/profile/addresses" className="flex items-center justify-between p-4 rounded-[16px] bg-primary/10 text-primary font-bold border border-primary/20 transition-colors shadow-sm">
                                <span className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 bg-primary text-primary-foreground p-1 rounded-md" /> Daftar Alamat
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-50" />
                            </Link>

                            <Link href="/profile/notifications" className="flex items-center justify-between p-4 rounded-[16px] text-muted-foreground font-bold border border-transparent hover:bg-muted hover:text-foreground transition-colors group">
                                <span className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground bg-muted group-hover:bg-background p-1 rounded-md transition-colors" /> Notifikasi
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Main Content Info */}
                    <AddressList initialAddresses={addresses || []} />
                </div>
            </div>
        </div>
    );
}
