import { useMedinaStore } from '@/store/useMedinaStore';

type Translations = {
    [key: string]: {
        [key: string]: string;
    };
};

export const translations: Translations = {
    en: {
        settings_title: 'Settings',
        account: 'Account',
        personal_information: 'Personal Information',
        security_password: 'Security & Password',
        push_notifications: 'Push Notifications',
        email_updates: 'Email Updates',
        app: 'App',
        language: 'Language',
        dark_mode: 'Dark Mode',
        support: 'Support',
        help_center: 'Help Center',
        terms_of_service: 'Terms of Service',
        privacy_policy: 'Privacy Policy',
        version: 'Version',
        select_language: 'Select Language',
        logout: 'Log Out',
        // Add more as needed
        hi: 'Hi',
        ready_to_shop: 'Ready to shop again?',
        wallet_balance: 'Wallet Balance',
        top_up: 'Top Up',
        history: 'History',
        my_orders: 'My Orders',
        view_transaction_history: 'View Transaction History',
        my_vouchers: 'My Vouchers',
        wishlist: 'Wishlist',
        delivery_address: 'Delivery Address',
        help_center_support: 'Help Center & Support',
        sign_in: 'Sign In',
        create_account: 'Create Account',
        guest_mode_title: 'Guest Mode',
        guest_mode_desc: 'Please login to access full features',
        guest: 'Guest',

        // Home
        happy_shopping: 'Happy Shopping',
        search_product_placeholder: 'Search product here',
        our_categories: 'Our Categories',
        recently_viewed: 'Recently Viewed',
        flash_deals: 'Flash Deals',
        best_seller_deals: 'Best Seller Deals',
        most_popular: 'Most Popular',
        special_for_you: 'Special For You',
        sold: 'Sold',

        // Cart
        my_cart: 'My Cart',
        select_all: 'Select All',
        total_item: 'Total Item',
        items_count: 'Items',

        // Categories
        all_categories: 'All Categories',
        search_categories_placeholder: 'Search categories here',
        no_categories_found: 'No Categories Found',
        no_categories_match: 'We couldn\'t find any categories matching',

        // Profile
        my_wallet: 'My Wallet',
        view_wallet_history: 'View Wallet History',
        my_balance: 'My Balance',
        updated: 'Updated',
        transfer: 'Transfer',
        my_purchase: 'My Purchase',
        reviews_tab: 'Reviews',
        description_tab: 'Description',
        added_to_cart_toast: 'Added to cart!',

        // Checkout
        checkout_title: 'Checkout',
        delivery_address_title: 'Delivery Address',
        select_address: 'Select Address',
        choose_delivery_destination: 'Choose delivery destination',
        transaction_details: 'Transaction Details',
        delivery_method: 'Delivery Method',
        payment_method: 'Payment Method',
        choose_payment_method: 'Choose Payment Method',
        discount_voucher: 'Discount Voucher',
        enter_voucher_code: 'Enter voucher code',
        apply: 'Apply',
        total_charge: 'Total Charge',
        finish_payment: 'Finish Payment',
        no_items_selected: 'No items selected for checkout',
        pending: 'Pending',
        packaging: 'Packaging',
        delivery: 'Delivery',
        ratings: 'Ratings',
        no_vouchers_yet: 'No vouchers yet',
        start_shopping_vouchers: 'Start shopping to unlock exclusive deals!',
        browse_products: 'Browse Products',
        change_password: 'Change Password',

        // Tabs
        home: 'Home',
        categories: 'Categories',
        cart: 'Cart',
        profile: 'Profile',

        // Notifications
        notifications_title: 'Notifications',
        no_notifications: 'No Notifications',
        mark_all_read: 'Mark All as Read',
        notification_settings: 'Notification Settings',
        enable_notifications: 'Enable Notifications',
        notifications_permission_title: 'Stay Updated',
        notifications_permission_message: 'Allow notifications to receive updates about your orders, promotions, and more',

        // Product Details
        product_details: 'Product Detail',
        see_all: 'See All',
        color: 'Color',
        size: 'Size',
        material: 'Material',
        stock: 'Stock',
        items: 'Items',
        weight: 'Weight',
        condition: 'Condition',
        new: 'New',
        na: 'N/A',
        weight_value: 'Weight Value',
    },
    id: {
        settings_title: 'Pengaturan',
        account: 'Akun',
        personal_information: 'Informasi Pribadi',
        security_password: 'Keamanan & Kata Sandi',
        push_notifications: 'Notifikasi Push',
        email_updates: 'Pembaruan Email',
        app: 'Aplikasi',
        language: 'Bahasa',
        dark_mode: 'Mode Gelap',
        support: 'Bantuan',
        help_center: 'Pusat Bantuan',
        terms_of_service: 'Syarat Layanan',
        privacy_policy: 'Kebijakan Privasi',
        version: 'Versi',
        select_language: 'Pilih Bahasa',
        logout: 'Keluar',
        // Add more as needed
        hi: 'Halo',
        ready_to_shop: 'Siap berbelanja lagi?',
        wallet_balance: 'Saldo Dompet',
        top_up: 'Isi Saldo',
        history: 'Riwayat',
        my_orders: 'Pesanan Saya',
        view_transaction_history: 'Lihat Riwayat Transaksi',
        my_vouchers: 'Voucher Saya',
        wishlist: 'Keinginanku',
        delivery_address: 'Alamat Pengiriman',
        help_center_support: 'Bantuan & Dukungan',
        sign_in: 'Masuk',
        create_account: 'Buat Akun',
        guest_mode_title: 'Mode Tamu',
        guest_mode_desc: 'Silakan masuk untuk akses fitur lengkap',
        guest: 'Tamu',

        // Home
        happy_shopping: 'Selamat Berbelanja',
        search_product_placeholder: 'Cari produk di sini',
        our_categories: 'Kategori Kami',
        recently_viewed: 'Baru Dilihat',
        flash_deals: 'Flash Sale',
        best_seller_deals: 'Paling Laris',
        most_popular: 'Paling Populer',
        special_for_you: 'Spesial Untukmu',
        sold: 'Terjual',

        // Cart
        my_cart: 'Keranjang Saya',
        select_all: 'Pilih Semua',
        total_item: 'Total Barang',
        items_count: 'Barang',

        // Categories
        all_categories: 'Semua Kategori',
        search_categories_placeholder: 'Cari kategori di sini',
        no_categories_found: 'Kategori Tidak Ditemukan',
        no_categories_match: 'Kami tidak dapat menemukan kategori yang cocok dengan',

        // Profile
        my_wallet: 'Dompet Saya',
        view_wallet_history: 'Lihat Riwayat Dompet',
        my_balance: 'Saldo Saya',
        updated: 'Diperbarui',
        transfer: 'Transfer',
        my_purchase: 'Pesanan Saya',
        see_all: 'Lihat Semua',
        pending: 'Menunggu',
        packaging: 'Dikemas',
        reviews_tab: 'Ulasan',
        description_tab: 'Deskripsi',
        added_to_cart_toast: 'Berhasil ditambahkan ke keranjang!',

        // Checkout
        checkout_title: 'Penagihan',
        delivery_address_title: 'Alamat Pengiriman',
        select_address: 'Pilih Alamat',
        choose_delivery_destination: 'Pilih tujuan pengiriman',
        transaction_details: 'Rincian Transaksi',
        delivery_method: 'Metode Pengiriman',
        payment_method: 'Metode Pembayaran',
        choose_payment_method: 'Pilih Metode Pembayaran',
        discount_voucher: 'Voucher Diskon',
        enter_voucher_code: 'Masukkan kode voucher',
        apply: 'Gunakan',
        total_charge: 'Total Tagihan',
        finish_payment: 'Buat Pesanan',
        no_items_selected: 'Belum ada produk yang dipilih',
        delivery: 'Dikirim',
        ratings: 'Penilaian',
        no_vouchers_yet: 'Belum ada voucher',
        start_shopping_vouchers: 'Mulai belanja untuk buka promo eksklusif!',
        browse_products: 'Lihat Produk',
        change_password: 'Ganti Kata Sandi',

        // Tabs
        home: 'Beranda',
        categories: 'Kategori',
        cart: 'Keranjang',
        profile: 'Profil',

        // Notifications
        notifications_title: 'Notifikasi',
        no_notifications: 'Tidak Ada Notifikasi',
        mark_all_read: 'Tandai Semua Dibaca',
        notification_settings: 'Pengaturan Notifikasi',
        enable_notifications: 'Aktifkan Notifikasi',
        notifications_permission_title: 'Tetap Terupdate',
        notifications_permission_message: 'Izinkan notifikasi untuk menerima update tentang pesanan, promosi, dan lainnya',

        // Product Details
        product_details: 'Detail Produk',
        color: 'Warna',
        size: 'Ukuran',
        material: 'Bahan',
        stock: 'Stok',
        items: 'Barang',
        weight: 'Berat',
        condition: 'Kondisi',
        new: 'Baru',
        na: 'Tidak Ada',
        weight_value: 'Nilai Berat',
    },
};

export function useTranslation() {
    const language = useMedinaStore((state) => state.settings.language);

    // Fallback to English if key doesn't exist
    const t = (key: string) => {
        return translations[language][key] || translations['en'][key] || key;
    };

    return { t, language };
}
