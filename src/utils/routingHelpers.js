/**
 * Routing utilities for handling base URL and navigation
 */

/**
 * Normalize base URL for React Router
 * Converts './' (used in offline builds) to '/' for React Router compatibility
 *
 * @param {string} baseUrl - The base URL from import.meta.env.BASE_URL or other source
 * @returns {string} Normalized base URL suitable for React Router basename
 *
 * @example
 * normalizeBaseUrl('./') // Returns '/'
 * normalizeBaseUrl('/aurorae-haven/') // Returns '/aurorae-haven/'
 * normalizeBaseUrl('/') // Returns '/'
 */
export function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) {
    return '/'
  }
  return baseUrl === './' ? '/' : baseUrl
}
