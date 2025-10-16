import { v4 as uuidv4 } from 'uuid'

/**
 * Generate a cryptographically secure UUID
 * Uses the uuid library (MIT-licensed) for consistent, secure UUID generation
 *
 * @returns {string} A UUID string
 */
export function generateSecureUUID() {
  return uuidv4()
}
