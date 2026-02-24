"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const loginSchema = z.object({
    email: z.string().email({ message: "Email tidak valid" }),
    password: z.string().min(6, { message: "Panjang Minimal Password: 6 karakter" }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: LoginValues) => {
        startTransition(async () => {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) {
                if (error.message === "Invalid login credentials") {
                    form.setError("root.serverError", { message: "Email atau kata sandi salah." });
                } else {
                    form.setError("root.serverError", { message: error.message });
                }
                return;
            }

            toast.success("Berhasil Masuk!", {
                description: "Selamat datang kembali di Alma Shop.",
            });
            router.push("/");
            router.refresh();
        });
    };

    const handleSocialLogin = (provider: string) => {
        toast.info("Fitur Segera Hadir!", {
            description: `Login menggunakan ${provider} sedang dalam tahap pengembangan.`
        });
    };

    return (
        <div className="w-full animate-in fade-in zoom-in-95 duration-500">
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {form.formState.errors.root?.serverError && (
                    <Alert variant="destructive" className="py-2 px-3 text-xs mb-2 bg-red-50 text-red-600 border-none rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="ml-2 font-medium">
                            {form.formState.errors.root.serverError.message}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-6">
                    {/* Email */}
                    <div className="flex flex-col gap-1.5 group">
                        <Label htmlFor="email" className="font-semibold text-[11px] sm:text-xs text-[#5a7bed] tracking-widest uppercase">Email</Label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-0 w-4 h-4 text-gray-400 group-focus-within:text-[#5a7bed] transition-colors" />
                            <Input
                                id="email"
                                placeholder="nama@email.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                disabled={isPending}
                                {...form.register("email")}
                                className="border-0 border-b border-gray-200 rounded-none pl-7 px-0 py-2 h-auto focus-visible:ring-0 focus-visible:border-[#5a7bed] bg-transparent text-sm sm:text-base font-medium text-gray-700 placeholder:text-gray-300 placeholder:font-normal transition-colors"
                            />
                        </div>
                        {form.formState.errors.email && (
                            <p className="text-[10px] sm:text-xs text-red-500 font-medium mt-1">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5 relative group">
                        <div className="flex justify-between items-center w-full">
                            <Label htmlFor="password" className="font-semibold text-[11px] sm:text-xs text-[#5a7bed] tracking-widest uppercase">
                                Kata Sandi
                            </Label>
                            <Link href="/auth/forgot-password" className="text-[10px] font-bold text-gray-400 hover:text-[#5a7bed] transition-colors tracking-wide">
                                Lupa sandi?
                            </Link>
                        </div>
                        <div className="relative flex items-center mt-0.5">
                            <Lock className="absolute left-0 w-4 h-4 text-gray-400 group-focus-within:text-[#5a7bed] transition-colors" />
                            <Input
                                id="password"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                disabled={isPending}
                                {...form.register("password")}
                                className="border-0 border-b border-gray-200 rounded-none pl-7 pr-8 px-0 py-2 h-auto focus-visible:ring-0 focus-visible:border-[#5a7bed] bg-transparent text-sm sm:text-base font-medium text-gray-700 placeholder:text-gray-300 placeholder:font-normal transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 text-gray-400 hover:text-[#5a7bed] transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {form.formState.errors.password && (
                            <p className="text-[10px] sm:text-xs text-red-500 font-medium mt-1">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-5 items-center">
                    <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full bg-[#5a7bed] hover:bg-[#4e81ff] text-white rounded-[12px] h-12 shadow-lg shadow-blue-500/20 font-bold tracking-wide transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-base"
                    >
                        {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {!isPending && "Masuk ke Akun"}
                    </Button>
                </div>

                {/* Separator */}
                <div className="relative mt-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span className="bg-white px-3">Atau masuk dengan</span>
                    </div>
                </div>

                {/* Social Login Dummy */}
                <div className="flex gap-3 mt-1">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-[12px] border-gray-200 text-gray-600 font-bold hover:bg-gray-50 h-11 transition-all hover:-translate-y-0.5 hover:shadow-md"
                        onClick={() => handleSocialLogin('Google')}
                    >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Google
                    </Button>
                </div>

                <div className="mt-2 text-center text-xs text-gray-500 font-medium">
                    Belum punya Akun?{" "}
                    <Link href="/auth/register" className="font-bold text-[#ff6b6b] hover:text-[#ff5252] transition-colors underline-offset-4 hover:underline">
                        Daftar disini
                    </Link>
                </div>
            </form>
        </div>
    );
}
