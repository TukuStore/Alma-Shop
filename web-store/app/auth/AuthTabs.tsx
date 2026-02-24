"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AuthTabs() {
    const pathname = usePathname();
    const isLogin = pathname?.includes("/login");

    return (
        <div className="flex items-center gap-6 mb-8">
            <Link
                href="/auth/register"
                className={`text-xl font-bold transition-all px-1 py-1 ${!isLogin ? "text-[#5a7bed] border-b-[3px] border-[#5a7bed]" : "text-gray-400 hover:text-gray-600"}`}
            >
                Daftar
            </Link>
            <Link
                href="/auth/login"
                className={`text-xl font-bold transition-all px-1 py-1 ${isLogin ? "text-[#5a7bed] border-b-[3px] border-[#5a7bed]" : "text-gray-400 hover:text-gray-600"}`}
            >
                Masuk
            </Link>
        </div>
    );
}
