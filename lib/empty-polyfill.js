// Empty shim for web — URL API is natively available in browsers
// This file replaces react-native-url-polyfill on web platform

// Re-export everything from native URL to satisfy imports
export const URL = globalThis.URL;
export const URLSearchParams = globalThis.URLSearchParams;

export function setupURLPolyfill() {
  // No-op on web - URL API is native
}
