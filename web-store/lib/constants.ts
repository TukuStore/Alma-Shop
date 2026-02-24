// ─── Alma Shop Constants ────────────────────────────

export const SITE_NAME = "Alma Shop";
export const SITE_DESCRIPTION =
    "Discover premium Indonesian sarongs — Songket, Batik, Sutra, and more. Shop the finest heritage textiles online.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// ─── Brand Colors (for programmatic use) ────────────
export const Colors = {
    primary: {
        DEFAULT: "#FF6B57",
        light: "#FF8A7A",
    },
    accent: {
        DEFAULT: "#121926",
        dark: "#000000",
    },
    info: "#0076F5",
    success: "#00D79E",
    error: "#FF3E38",
    warning: "#FFB13B",
    neutral: {
        25: "#FCFCFD",
        50: "#F8FAFC",
        100: "#EEF2F6",
        200: "#E3E8EF",
        300: "#CDD5DF",
        400: "#9AA4B2",
        500: "#697586",
        600: "#4B5565",
        700: "#364152",
        800: "#202939",
        900: "#121926",
    },
} as const;

// ─── Currency Formatter ─────────────────────────────
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// ─── Sarung Categories ──────────────────────────────
export const SARUNG_CATEGORIES = [
    "Sarung Songket",
    "Batik Cap",
    "Batik Tulis",
    "Batik Kombinasi",
    "Batik Printing",
    "Sutra/Spunsilk",
    "Katun/Poliester",
    "Goyor",
] as const;
