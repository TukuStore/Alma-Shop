// Local image registry for offline/demo products
// This allows us to use bundled assets when remote URLs are placeholders

import { ImageSourcePropType } from 'react-native';

export const LocalProductImages: Record<string, ImageSourcePropType[]> = {
    // Map by Product Name (partial match) or ID if known
    'sarung': [
        require('@/assets/images/products/sarung-1.jpg'),
        require('@/assets/images/products/sarung-2.jpg'),
        require('@/assets/images/products/sarung-3.jpg'),
    ],
};

// Helper to get images for a product
export const getProductImages = (productName: string, remoteImages: string[]): any[] => {
    // Check for Sarung Songket
    if (productName.toLowerCase().includes('sarung') && productName.toLowerCase().includes('songket')) {
        return LocalProductImages['sarung'];
    }

    // Return original remote images if no local override
    return remoteImages;
};
