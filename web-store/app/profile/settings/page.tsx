"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Bell, Briefcase, ChevronRight, Loader2, Lock, MapPin, Save, Settings, Shield, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        async function loadUser() {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                setUser(data.user);
                setFullName(data.user.user_metadata?.full_name || "");
            } else {
                router.push("/auth/login");
            }
        }
        loadUser();
    }, [router, supabase.auth]);

    if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#5a7bed]" /></div>;

    const initials = (fullName || "P A").split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

    const handleSave = () => {
        startTransition(async () => {
            const updates: any = {};
            if (fullName !== user.user_metadata?.full_name) {
                updates.data = { full_name: fullName };
            }
            if (password) {
                updates.password = password;
            }

            if (Object.keys(updates).length === 0) {
                toast("Tidak ada perubahan", { description: "Data sudah sama dengan sebelumnya." });
                return;
            }

            const { error } = await supabase.auth.updateUser(updates);

            if (error) {
                toast.error("Gagal menyimpan pengaturan", { description: error.message });
            } else {
                toast.success("Pengaturan Berhasil Disimpan!", { description: "Data akun Anda telah diperbarui." });
                setPassword("");
                router.refresh();
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header Banner */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5a7bed] via-[#4e81ff] to-[#3a5adb]"></div>
                <div className="absolute -top-20 -left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute top-10 -right-20 w-80 h-80 bg-[#ff6b6b]/20 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative -mt-32">

                {/* Profile Avatar Bar */}
                <div className="bg-white rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center shadow-2xl shadow-gray-200/50 border border-gray-100 mb-8 animate-in slide-in-from-bottom-6 duration-500">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[24px] bg-gradient-to-tr from-[#5a7bed] to-[#4e81ff] flex items-center justify-center text-white text-3xl md:text-5xl font-display font-extrabold shadow-lg shadow-blue-500/30 border-4 border-white transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                {initials}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm" title="Online"></div>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">{fullName}</h1>
                            <p className="text-gray-500 font-medium text-sm md:text-base mb-1">{user.email}</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#5a7bed]/10 text-[#5a7bed] text-[10px] font-bold uppercase tracking-widest mt-2">
                                Member Aktif
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <div className="w-full lg:w-72 shrink-0">
                        <div className="bg-white rounded-[24px] p-4 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col gap-2 sticky top-24 animate-in slide-in-from-left-8 duration-700">
                            <Link href="/profile" className="flex items-center justify-between p-4 rounded-[16px] text-gray-500 font-bold border border-transparent hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                                <span className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-gray-400 group-hover:text-gray-900 bg-gray-100 group-hover:bg-white p-1 rounded-md transition-colors" /> Informasi Utama
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
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

                            <Link href="/profile/notifications" className="flex items-center justify-between p-4 rounded-[16px] text-gray-500 font-bold border border-transparent hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                                <span className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-gray-400 group-hover:text-gray-900 bg-gray-100 group-hover:bg-white p-1 rounded-md transition-colors" /> Notifikasi
                                </span>
                            </Link>

                            <div className="h-px bg-gray-100 my-2 mx-4"></div>

                            <Link href="/profile/settings" className="flex items-center justify-between p-4 rounded-[16px] bg-[#5a7bed]/5 text-[#5a7bed] font-bold border border-[#5a7bed]/10 transition-colors shadow-sm">
                                <span className="flex items-center gap-3">
                                    <Settings className="w-5 h-5 bg-[#5a7bed]/10 p-1 rounded-md" /> Pengaturan
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-50" />
                            </Link>
                        </div>
                    </div>

                    {/* Main Content Info */}
                    <div className="flex-1 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 font-bold">
                                    <Settings className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h2>
                                    <p className="text-sm text-gray-500 font-medium">Perbarui identitas diri dan preferensi keamanan Anda.</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2 group">
                                    <Label className="font-semibold text-xs tracking-wide uppercase text-gray-500 group-focus-within:text-[#5a7bed] transition-colors">Nama Lengkap Tampilan</Label>
                                    <div className="relative">
                                        <Input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Masukkan nama lengkap Anda..."
                                            className="h-14 rounded-[16px] bg-gray-50/50 border-gray-100 font-bold text-gray-900 focus:border-[#5a7bed] focus:bg-white focus:ring-4 focus:ring-[#5a7bed]/10 transition-all pl-12 shadow-sm"
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5a7bed] transition-colors" />
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium ml-1">Nama ini akan ditampilkan pada resi pengiriman dan halaman profil Anda.</p>
                                </div>

                                <div className="space-y-2 group">
                                    <Label className="font-semibold text-xs tracking-wide uppercase text-gray-500 group-focus-within:text-[#5a7bed] transition-colors">Alamat Email Terdaftar (Tidak Dapat Diubah)</Label>
                                    <div className="relative">
                                        <Input
                                            defaultValue={user.email}
                                            disabled
                                            className="h-14 rounded-[16px] bg-gray-100/50 border-gray-100 cursor-not-allowed font-bold text-gray-400 opacity-100 pl-12 shadow-sm"
                                        />
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 border-dashed">
                                    <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-[#ff6b6b]" /> Perbarui Kata Sandi (Opsional)
                                    </h3>

                                    <div className="space-y-2 group">
                                        <Label className="font-semibold text-xs tracking-wide uppercase text-gray-500 group-focus-within:text-[#5a7bed] transition-colors">Kata Sandi Baru</Label>
                                        <div className="relative">
                                            <Input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Biarkan kosong jika tidak ingin mengubah..."
                                                className="h-14 rounded-[16px] bg-gray-50/50 border-gray-100 font-bold text-gray-900 focus:border-[#5a7bed] focus:bg-white focus:ring-4 focus:ring-[#5a7bed]/10 transition-all pl-12 shadow-sm"
                                            />
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5a7bed] transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isPending}
                                        className="h-14 rounded-[16px] bg-[#5a7bed] hover:bg-[#4e81ff] text-white shadow-xl shadow-blue-500/20 font-bold text-base px-10 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center w-full sm:w-auto"
                                    >
                                        {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                        {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
                                    </Button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
