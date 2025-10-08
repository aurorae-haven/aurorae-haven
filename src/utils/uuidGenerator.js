/**
 * Generate a cryptographically secure UUID
 * Uses crypto.randomUUID if available, falls back to crypto.getRandomValues
 *
 * @returns {string} A UUID string
 */
export function generateSecureUUID() {
  // Try crypto.randomUUID() first (most browsers since 2021)
  if (typeof window.crypto !== 'undefined' && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }

  // Fallback to crypto.getRandomValues (secure random bytes)
  if (typeof window.crypto !== 'undefined' && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(16)
    window.crypto.getRandomValues(bytes)

    // Set version (4) and variant bits per RFC 4122
    bytes[6] = (bytes[6] & 0x0f) | 0x40 // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80 // Variant 10

    // Convert to UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const hex = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('')
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`
  }

  // Last resort fallback (should never happen in modern browsers)
  // Not cryptographically secure, but better than nothing
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
