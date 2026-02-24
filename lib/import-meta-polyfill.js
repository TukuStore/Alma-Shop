/**
 * Polyfill for import.meta on Web
 * This fixes "Cannot use 'import.meta' outside a module" errors
 */

if (typeof import.meta === 'undefined') {
    // Create a polyfill for import.meta
    Object.defineProperty(globalThis, 'import', {
        value: {
            meta: {
                url: typeof window !== 'undefined' ? window.location.href : '',
                env: process.env || {},
            },
        },
        configurable: true,
        writable: true,
    });
}
