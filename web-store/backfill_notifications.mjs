import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    const { data: profiles, error } = await supabase.from('profiles').select('id');
    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log(`Found ${profiles.length} profiles to backfill.`);

    for (const p of profiles || []) {
        console.log('Inserting notifications for', p.id);
        await supabase.from('notifications').insert([
            {
                user_id: p.id,
                title: "Pesanan Dikirim! 🚚",
                message: "Pesanan Anda sedang dalam perjalanan menggunakan kurir Reguler. Jangan lupa cek resi pengiriman kamu sekarang.",
                type: "order",
                is_read: false,
                action_url: "/orders",
                created_at: new Date().toISOString()
            },
            {
                user_id: p.id,
                title: "Promo Flash Sale Sarung 🔥",
                message: "Diskon cuci gudang hingga 50% untuk koleksi sarung terbaru! Jangan sampai kehabisan, promo Flash Sale berlaku cuma sampai besok malam.",
                type: "promo",
                is_read: true,
                action_url: "/flash-sale",
                created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
                user_id: p.id,
                title: "Pembayaran Berhasil Diverifikasi 💳",
                message: "Terima kasih! Pembayaran untuk pesanan telah kami terima. Pesanan Anda akan segera diproses oleh tim.",
                type: "wallet",
                is_read: true,
                action_url: "/orders",
                created_at: new Date(Date.now() - 172800000).toISOString()
            }
        ]);
    }
    console.log('DONE backfilling notifications.');
}

run();
