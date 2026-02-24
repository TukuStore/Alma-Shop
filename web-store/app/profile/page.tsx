import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { Bell, Briefcase, ChevronRight, Clock, Info, LogOut, MapPin, Package, Settings, Shield, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const fullName = user.user_metadata?.full_name || "Pengguna Alma";
    const initials = fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    const { data: recentOrders } = await supabase
        .from("orders")
        .select(`
            id, status, created_at, total_amount,
            items:order_items(
                product:products(name)
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header Banner */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <div className="absolute inset-0 bg-primary/90"></div>

                {/* Abstract shapes in banner */}
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

                    <div className="mt-6 md:mt-0 flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
                        <Link href="/profile/settings" className="flex-1 md:flex-none">
                            <Button className="w-full h-12 rounded-[16px] border border-border bg-white hover:bg-muted text-foreground shadow-sm font-bold transition-all hover:border-primary hover:text-primary focus:ring-4 focus:ring-primary/10">
                                <Settings className="w-4 h-4 mr-2" /> Pengaturan
                            </Button>
                        </Link>
                        <form action="/auth/signout" method="post" className="flex-1 md:flex-none">
                            <Button className="w-full h-12 rounded-[16px] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-sm font-bold transition-all">
                                <LogOut className="w-4 h-4 mr-2" /> Keluar
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <div className="w-full lg:w-72 shrink-0">
                        <div className="bg-white rounded-[24px] p-4 shadow-xl shadow-black/5 border border-border flex flex-col gap-2 sticky top-24 animate-in slide-in-from-left-8 duration-700">
                            <Link href="/profile" className="flex items-center justify-between p-4 rounded-[16px] bg-primary/10 text-primary font-bold border border-primary/20 transition-colors shadow-sm">
                                <span className="flex items-center gap-3">
                                    <User className="w-5 h-5 bg-primary text-primary-foreground p-1 rounded-md" /> Informasi Utama
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-50" />
                            </Link>

                            <Link href="/orders" className="flex items-center justify-between p-4 rounded-[16px] text-gray-500 font-bold border border-transparent hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                                <span className="flex items-center gap-3">
                                    <Briefcase className="w-5 h-5 text-gray-400 group-hover:text-gray-900 bg-gray-100 group-hover:bg-white p-1 rounded-md transition-colors" /> Riwayat Transaksi
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                            </Link>

                            <Link href="/profile/addresses" className="flex items-center justify-between p-4 rounded-[16px] text-gray-500 font-bold border border-transparent hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                                <span className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 group-hover:text-gray-900 bg-gray-100 group-hover:bg-white p-1 rounded-md transition-colors" /> Daftar Alamat
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                            </Link>

                            <Link href="/profile/notifications" className="flex items-center justify-between p-4 rounded-[16px] text-muted-foreground font-bold border border-transparent hover:bg-muted hover:text-foreground transition-colors group">
                                <span className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground bg-muted group-hover:bg-background p-1 rounded-md transition-colors" /> Notifikasi
                                </span>
                                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">0 Baru</span>
                            </Link>
                        </div>
                    </div>

                    {/* Main Content Info */}
                    <div className="flex-1 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 font-bold">
                                    <Info className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Keamanan & Data Pribadi</h2>
                                    <p className="text-sm text-gray-500 font-medium">Informasi ini rahasia dan dikelola dengan aman.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 group">
                                    <Label className="font-semibold text-xs tracking-wide uppercase text-muted-foreground group-focus-within:text-primary transition-colors">Nama Lengkap (Sesuai KTP)</Label>
                                    <div className="relative">
                                        <Input
                                            defaultValue={fullName}
                                            disabled
                                            className="h-14 rounded-[16px] bg-muted/50 border-border cursor-not-allowed font-bold text-foreground opacity-100 pl-5 shadow-sm"
                                        />
                                        <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500/50" />
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <Label className="font-semibold text-xs tracking-wide uppercase text-muted-foreground group-focus-within:text-primary transition-colors">Alamat Email Terdaftar</Label>
                                    <div className="relative">
                                        <Input
                                            defaultValue={user.email}
                                            disabled
                                            className="h-14 rounded-[16px] bg-muted/50 border-border cursor-not-allowed font-bold text-foreground opacity-100 pl-5 shadow-sm"
                                        />
                                        <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500/50" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-gradient-to-r from-muted/30 to-background rounded-[24px] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-base text-foreground mb-1 flex items-center gap-2">
                                        Ubah Kata Sandi / Data Diri?
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                        Anda dapat memperbarui informasi login dan identitas akun Anda melalui menu Pengaturan.
                                    </p>
                                </div>
                                <Link href="/profile/settings">
                                    <Button className="shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold text-sm h-12 px-8 transition-all hover:-translate-y-0.5">
                                        Buka Pengaturan
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Activity Card */}
                        <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border">
                            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" /> Aktivitas Terkini
                            </h2>

                            {(!recentOrders || recentOrders.length === 0) ? (
                                <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-[24px] border border-dashed border-border">
                                    <p className="text-sm font-medium text-muted-foreground mb-4 px-4 text-center">Belum ada pesanan terbaru dari Anda.</p>
                                    <Link href="/products">
                                        <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6 shadow-sm">
                                            Jelajahi Katalog
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentOrders.map((order) => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const firstItemName = (order.items?.[0] as any)?.product?.name || "Pesanan Sarung";
                                        const remainingItemsCount = (order.items?.length || 0) - 1;

                                        return (
                                            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[20px] bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">
                                                            {firstItemName}
                                                            {remainingItemsCount > 0 && <span className="text-gray-400 font-medium text-xs ml-1"> (+{remainingItemsCount} lainnya)</span>}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 font-medium mt-1">
                                                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                                    <Badge variant="outline" className={`px-3 py-1 bg-white shadow-sm border-border font-bold text-[10px] uppercase tracking-widest ${order.status === 'pending' ? 'text-amber-500' : 'text-primary'}`}>
                                                        {order.status}
                                                    </Badge>

                                                    <Link href={`/orders/${order.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary hover:bg-primary/10 rounded-full px-3">
                                                            Lihat Detail
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="pt-4 text-center">
                                        <Link href="/orders" className="text-sm font-bold text-primary hover:text-primary/90 hover:underline">
                                            Lihat Semua Riwayat
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
