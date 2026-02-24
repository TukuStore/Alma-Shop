export function formatPrice(price: number): string {
    return 'Rp ' + Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
