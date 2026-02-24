"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addAddress(formData: FormData) {
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Silakan login terlebih dahulu untuk menyimpan alamat." };
    }

    const label = formData.get("label")?.toString() || "Rumah";
    const recipient_name = formData.get("recipient_name")?.toString();
    const phone_number = formData.get("phone_number")?.toString();
    const address_line = formData.get("address_line")?.toString();
    const city = formData.get("city")?.toString();
    const province = formData.get("province")?.toString();
    const postal_code = formData.get("postal_code")?.toString();
    const is_default = formData.get("is_default") === "true";

    if (!recipient_name || !phone_number || !address_line || !city || !province || !postal_code) {
        return { error: "Semua kolom wajib diisi kecuali dinyatakan opsional." };
    }

    try {
        if (is_default) {
            // Unset previous defaults
            await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
        }

        const { error } = await supabase.from("addresses").insert({
            user_id: user.id,
            label,
            recipient_name,
            phone_number,
            address_line,
            city,
            province,
            postal_code,
            is_default
        });

        if (error) {
            console.error("Supabase insert error:", error);
            return { error: "Gagal menyimpan alamat. Coba beberapa saat lagi." };
        }

        revalidatePath("/profile/addresses");
        revalidatePath("/checkout");
        return { success: true };
    } catch (err) {
        return { error: "Terjadi kesalahan sistem saat menyimpan alamat." };
    }
}

export async function deleteAddress(addressId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Akses ditolak." };

    try {
        const { error } = await supabase.from("addresses").delete().match({ id: addressId, user_id: user.id });
        if (error) return { error: "Gagal menghapus alamat." };

        revalidatePath("/profile/addresses");
        revalidatePath("/checkout");
        return { success: true };
    } catch (err) {
        return { error: "Terjadi kesalahan sistem." };
    }
}

export async function setAsDefaultAddress(addressId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Akses ditolak." };

    try {
        // Unset old default
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id).eq("is_default", true);
        // Set new default
        const { error } = await supabase.from("addresses").update({ is_default: true }).match({ id: addressId, user_id: user.id });

        if (error) return { error: "Gagal mengatur alamat utama." };

        revalidatePath("/profile/addresses");
        return { success: true };
    } catch (err) {
        return { error: "Terjadi kesalahan sistem." };
    }
}
