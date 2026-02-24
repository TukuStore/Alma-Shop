import { ImageSource } from 'expo-image';

// Map slugs to local assets (matching ACTUAL file names in folder)
export const CategoryImages: Record<string, ImageSource> = {
    'sarung-tenun': require('../assets/images/category/sarung songket.png'),
    'sarung-wadimor': require('../assets/images/category/sarung batik goyor.jpg'),
    'sarung-gajah': require('../assets/images/category/Sarung Sutra Spunsilk.jpg'),
    'sarung-mangga': require('../assets/images/category/sarung batik printing.jpg'),
    'sarung-atlas': require('../assets/images/category/sarung  polyester_katun.jpg'), // Note: double space in filename
    'sarung-hitam': require('../assets/images/category/satung batik cap.jpg'), // Note: "satung" typo in actual file
    'sarung-putih': require('../assets/images/category/sarung batik tulis.jpg'),
    'sarung-motif': require('../assets/images/category/sarung batik kombinasi.jpg'),
};

// Fallback image (generic textile)
const DEFAULT_PATTERN = 'https://images.unsplash.com/photo-1522262590532-a991489a0252?q=80&w=200&auto=format&fit=crop';

export const getCategoryImage = (slug: string, remoteUrl?: string | null): ImageSource | string => {
    if (!slug) return remoteUrl || DEFAULT_PATTERN;
    const key = slug.toLowerCase().trim();

    if (CategoryImages[key]) {
        return CategoryImages[key];
    }

    return remoteUrl || DEFAULT_PATTERN;
};
