/**
 * Shared utilities for GitHub Pages SPA redirect handling
 * These functions ensure consistent path computation across 404.html and index.jsx
 */

/**
 * Compute the base path for GitHub Pages project site redirect
 * Takes a full pathname and returns the base URL to redirect to
 *
 * For GitHub Pages project sites (e.g., /aurorae-haven/schedule),
 * this extracts the first path segment to redirect to the app root
 *
 * @param {string} pathname - The current pathname (e.g., '/aurorae-haven/schedule')
 * @param {string} origin - The origin URL (e.g., 'https://example.github.io')
 * @returns {string} The base path to redirect to (e.g., 'https://example.github.io/aurorae-haven/')
 *
 * @example
 * computeBasePath('/aurorae-haven/schedule', 'https://example.github.io')
 * // Returns: 'https://example.github.io/aurorae-haven/'
 *
 * @example
 * computeBasePath('/schedule', 'https://example.github.io')
 * // Returns: 'https://example.github.io/schedule/'
 */
export function computeBasePath(pathname, origin) {
  // Filter out empty segments from pathname
  const pathSegments = pathname.split('/').filter((s) => s !== '')

  // For paths like /aurorae-haven/schedule, we want /aurorae-haven/
  // For paths like /schedule, we want /schedule/
  // This ensures we redirect to the first path segment (the app base)
  let basePath
  if (pathSegments.length > 0) {
    // Use the first segment as the base
    basePath = origin + '/' + pathSegments[0] + '/'
  } else {
    // Fallback to root for empty paths
    basePath = origin + '/'
  }

  return basePath
}

/**
 * Normalize a redirect path by removing the base URL prefix
 * This converts an absolute path to a React Router compatible relative path
 *
 * @param {string} redirectPath - The full redirect path (e.g., '/aurorae-haven/schedule')
 * @param {string} basename - The base URL to remove (e.g., '/aurorae-haven/')
 * @returns {string} The normalized path for React Router (e.g., '/schedule')
 *
 * @example
 * normalizeRedirectPath('/aurorae-haven/schedule', '/aurorae-haven/')
 * // Returns: '/schedule'
 *
 * @example
 * normalizeRedirectPath('/aurorae-haven/tasks?filter=urgent', '/aurorae-haven/')
 * // Returns: '/tasks?filter=urgent'
 *
 * @example
 * normalizeRedirectPath('/aurorae-haven/', '/aurorae-haven/')
 * // Returns: '/'
 */
/**
 * Escapes special characters in a string for use in a regular expression.
 *
 * @param {string} string - The string to escape.
 * @returns {string} The escaped string safe for use in RegExp constructors.
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeRedirectPath(redirectPath, basename) {
  // Remove the basename from the redirectPath to get the route
  // The first replacement removes the basename (e.g., '/aurorae-haven/' or './')
  // The second replacement normalizes multiple leading slashes to a single slash
  const escapedBasename = escapeRegExp(basename);
  const path = redirectPath.replace(new RegExp('^' + escapedBasename), '/').replace(/^\/+/, '/');
  return path
}

/**
 * Build the full redirect path including pathname, search, and hash
 * This is used to store the complete URL state before redirecting
 *
 * @param {string} pathname - The pathname (e.g., '/aurorae-haven/schedule')
 * @param {string} search - The query string (e.g., '?id=123')
 * @param {string} hash - The hash fragment (e.g., '#top')
 * @returns {string} The complete redirect path
 *
 * @example
 * buildRedirectPath('/aurorae-haven/schedule', '?id=123', '#top')
 * // Returns: '/aurorae-haven/schedule?id=123#top'
 *
 * @example
 * buildRedirectPath('/aurorae-haven/schedule', '', '')
 * // Returns: '/aurorae-haven/schedule'
 */
export function buildRedirectPath(pathname, search, hash) {
  return pathname + search + hash
}
