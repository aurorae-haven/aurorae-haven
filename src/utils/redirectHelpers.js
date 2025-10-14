/**
 * Shared utilities for GitHub Pages SPA redirect handling
 * These functions ensure consistent path computation across 404.html and index.jsx
 */

/**
 * Compute the base path for GitHub Pages project site redirect
 * Takes a full pathname and returns the base URL to redirect to
 *
 * For GitHub Pages project sites (e.g., /repo-name/page),
 * this extracts the first path segment to redirect to the app root
 *
 * @param {string} pathname - The current pathname (e.g., '/repo-name/page')
 * @param {string} origin - The origin URL (e.g., 'https://example.github.io')
 * @returns {string} The base path to redirect to (e.g., 'https://example.github.io/repo-name/')
 *
 * @example
 * computeBasePath('/repo-name/page', 'https://example.github.io')
 * // Returns: 'https://example.github.io/repo-name/'
 *
 * @example
 * computeBasePath('/page', 'https://example.github.io')
 * // Returns: 'https://example.github.io/page/'
 */
export function computeBasePath(pathname, origin) {
  // Filter out empty segments from pathname
  const pathSegments = pathname.split('/').filter((s) => s !== '')

  // For paths like /repo-name/page, we want /repo-name/
  // For paths like /page, we want /page/
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
 * @param {string} redirectPath - The full redirect path (e.g., '/repo-name/page')
 * @param {string} basename - The base URL to remove (e.g., '/repo-name/')
 * @returns {string} The normalized path for React Router (e.g., '/page')
 *
 * @example
 * normalizeRedirectPath('/repo-name/page', '/repo-name/')
 * // Returns: '/page'
 *
 * @example
 * normalizeRedirectPath('/repo-name/tasks?filter=urgent', '/repo-name/')
 * // Returns: '/tasks?filter=urgent'
 *
 * @example
 * normalizeRedirectPath('/repo-name/', '/repo-name/')
 * // Returns: '/'
 */
/**
 * Escapes special characters in a string for use in a regular expression.
 * This is a security-critical function that prevents regex injection attacks
 * by ensuring user-provided strings or dynamic values are treated as literal
 * text when used in RegExp constructors.
 *
 * @param {string} string - The string to escape (e.g., a basename or path segment).
 * @returns {string} The escaped string safe for use in RegExp constructors.
 *
 * @example
 * escapeRegExp('/aurorae-haven/')
 * // Returns: '\\/aurorae-haven\\/'
 *
 * @example
 * escapeRegExp('.')
 * // Returns: '\\.' (prevents matching any character)
 *
 * @example
 * const basename = '/my-app/'
 * const escapedBasename = escapeRegExp(basename)
 * const regex = new RegExp(`^${escapedBasename}`)
 * // regex safely matches paths starting with '/my-app/'
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function normalizeRedirectPath(redirectPath, basename) {
  // Remove the basename from the redirectPath to get the route
  // The first replacement removes the basename (e.g., '/repo-name/' or './')
  // The second replacement normalizes multiple leading slashes to a single slash
  const escapedBasename = escapeRegExp(basename)
  const regex = new RegExp(`^${escapedBasename}`)
  const path = redirectPath.replace(regex, '/').replace(/^\/+/, '/')
  return path
}

/**
 * Build the full redirect path including pathname, search, and hash
 * This is used to store the complete URL state before redirecting
 *
 * @param {string} pathname - The pathname (e.g., '/repo-name/page')
 * @param {string} search - The query string (e.g., '?id=123')
 * @param {string} hash - The hash fragment (e.g., '#top')
 * @returns {string} The complete redirect path
 *
 * @example
 * buildRedirectPath('/repo-name/page', '?id=123', '#top')
 * // Returns: '/repo-name/page?id=123#top'
 *
 * @example
 * buildRedirectPath('/repo-name/page', '', '')
 * // Returns: '/repo-name/page'
 */
export function buildRedirectPath(pathname, search, hash) {
  return pathname + search + hash
}
