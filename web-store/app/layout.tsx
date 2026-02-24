import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ChatbotWidget } from "@/components/ui/chatbot-widget";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role === "admin") {
      isAdmin = true;
    }
  }
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased overflow-x-hidden flex flex-col min-h-screen`}
      >
        <Navbar user={user} categories={categories || []} isAdmin={isAdmin} />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatbotWidget />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
