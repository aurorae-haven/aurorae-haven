/**
 * Configuration constants
 * Centralized constants for application configuration to maintain consistency
 */

/**
 * The default base path for GitHub Pages deployment.
 *
 * This constant should be used in multiple contexts to ensure consistency:
 * - Vite config: Set as the `base` option to configure the correct asset paths for deployment.
 * - React Router basename: Use as the `basename` prop to ensure routing works under the subpath.
 * - Service worker scope: Use to scope service worker registration to the correct subpath.
 *
 * Example: If your repository is `aurorae-haven`, the base path should be `/aurorae-haven/`.
 * This matches the URL structure: https://username.github.io/aurorae-haven/
 */
export const DEFAULT_GITHUB_PAGES_BASE_PATH = process.env.VITE_GITHUB_PAGES_BASE_PATH || '/aurorae-haven/';

/**
 * Base path without trailing slash.
 *
 * Useful for contexts that require paths without trailing slashes:
 * - Express routes: Express treats paths with/without trailing slashes differently
 * - URL construction: Building URLs that should not have double slashes
 * - Test assertions: Comparing paths without trailing slashes
 *
 * Derived from DEFAULT_GITHUB_PAGES_BASE_PATH by removing the trailing slash.
 */
export const DEFAULT_GITHUB_PAGES_BASE_PATH_NO_TRAILING_SLASH = DEFAULT_GITHUB_PAGES_BASE_PATH.slice(0, -1);
