import { Download, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AuthTabs } from "./AuthTabs";

export const metadata: Metadata = {
    title: "Autentikasi | Alma Shop",
    description: "Masuk atau daftar untuk berbelanja di Alma Shop.",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#2b3040] p-4 lg:p-10 font-inter">
            {/* Top Bar for Mobile */}
            <div className="absolute top-4 left-4 right-4 z-10 flex md:hidden items-center justify-between">
                <Link href="/" className="text-white font-bold text-lg drop-shadow-md">
                    Alma Shop
                </Link>
                <a
                    href="/downloads/AlmaStore-App.apk"
                    download
                    className="flex items-center gap-1.5 text-[10px] font-bold text-[#ff6b6b] bg-white px-3 py-1.5 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                >
                    <Download className="w-3 h-3" />
                    Unduh Aplikasi
                </a>
            </div>

            {/* Main Card Container */}
            <div className="w-full max-w-[900px] min-h-[600px] bg-white rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10">

                {/* Left side: Blue Gradient Panel */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-[#6b9cf6] via-[#4e81ff] to-[#3a5adb] p-8 md:p-10 flex flex-col justify-between text-white relative overflow-hidden order-2 md:order-1 min-h-[300px] md:min-h-full">

                    {/* Abstract decorative shapes inside left panel */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-10 -right-10 w-64 h-64 bg-[#ff6b6b]/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />

                    {/* Header Logo */}
                    <div className="relative z-10 flex flex-row items-center gap-2 mt-4 md:mt-0">
                        {/* Custom White Logo (filtered) */}
                        <div className="relative w-6 h-6">
                            <Image
                                src="/assets/images/logo.png"
                                alt="Alma Store Logo"
                                fill
                                className="object-contain mix-blend-screen"
                            />
                        </div>
                        <span className="font-bold tracking-widest text-xs lg:text-sm uppercase">Alma Store</span>
                    </div>

                    {/* Central Graphic */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-10 md:my-auto">
                        <div className="relative flex items-center justify-center group cursor-pointer transition-transform duration-500 hover:scale-110">
                            {/* Colorful background abstract elements */}
                            <div className="absolute w-24 h-4 bg-[#ff6b6b] -rotate-45 rounded-full blur-[2px] opacity-80 left-0 top-10" />
                            <div className="absolute w-24 h-4 bg-[#ffd166] rotate-45 rounded-full blur-[2px] opacity-80 right-0 top-10" />

                            {/* Main Custom Logo Structure matching the design */}
                            <div className="relative w-[160px] h-[160px] drop-shadow-2xl opacity-95">
                                <Image
                                    src="/assets/images/logo.png"
                                    alt="Alma Store Banner Logo"
                                    fill
                                    className="object-contain mix-blend-screen drop-shadow-2xl"
                                />
                            </div>
                        </div>
                        <p className="mt-8 text-white/90 font-bold tracking-widest uppercase text-xs">Sarung Premium Indonesia</p>
                    </div>

                    {/* Footer / Copyright */}
                    <div className="relative z-10 text-[10px] md:text-xs text-white/70 font-medium text-center md:text-left mt-4 md:mt-0">
                        Hak Cipta © {new Date().getFullYear()}, Alma Store. Seluruh hak cipta dilindungi.
                    </div>
                </div>

                {/* Right side: White Form Panel */}
                <div className="w-full md:w-1/2 px-8 py-10 md:py-12 md:px-12 bg-white flex flex-col relative justify-between order-1 md:order-2 rounded-t-[32px] md:rounded-l-none md:rounded-r-[40px] -mt-6 md:mt-0 z-20 md:z-auto">

                    <div className="flex-1 flex flex-col justify-center max-w-[340px] mx-auto w-full">
                        {/* Custom Tabs */}
                        <AuthTabs />

                        <div className="w-full mt-2">
                            {children}
                        </div>
                    </div>

                    {/* Socials & Download (Hidden on mobile as it's at top) */}
                    <div className="mt-10 md:mt-12 flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 hidden md:flex">
                        <div className="flex items-center gap-5 text-gray-400">
                            <Link href="#" className="hover:text-primary transition-colors"><Linkedin className="w-[18px] h-[18px]" /></Link>
                            <Link href="#" className="hover:text-primary transition-colors"><Instagram className="w-[18px] h-[18px]" /></Link>
                            <Link href="#" className="hover:text-primary transition-colors"><Facebook className="w-[18px] h-[18px]" /></Link>
                            <Link href="#" className="hover:text-primary transition-colors"><Twitter className="w-[18px] h-[18px]" /></Link>
                        </div>

                        <a
                            href="/downloads/AlmaStore-App.apk"
                            download
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#5a7bed] transition-colors"
                        >
                            <Download className="w-[14px] h-[14px]" />
                            Unduh Aplikasi
                        </a>
                    </div>
                </div>
            </div>

            {/* Background elements for entire page */}
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#ff6b6b]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed top-0 left-0 w-96 h-96 bg-[#4e81ff]/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
