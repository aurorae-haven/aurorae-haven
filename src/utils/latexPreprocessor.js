/**
 * LaTeX Preprocessor Utility
 * Handles preprocessing of LaTeX content before markdown rendering
 * to ensure proper line break handling within math blocks
 */

/**
 * Preprocesses LaTeX content to convert newlines within math blocks to LaTeX line breaks
 * This ensures that multi-line equations display correctly
 *
 * @param {string} content - Markdown content containing LaTeX math blocks
 * @returns {string} Preprocessed content with LaTeX line breaks
 *
 * @example
 * // Single $ blocks (inline math with newlines)
 * preprocessLatex('$\n\\phi = x\n\\alpha = y\n$')
 * // Returns: '$\\phi = x \\\\ \\alpha = y$'
 *
 * @example
 * // Double $$ blocks (display math)
 * preprocessLatex('$$\n\\phi = x\n\\alpha = y\n$$')
 * // Returns: '$$\n\\phi = x \\\\ \\alpha = y\n$$'
 */
export function preprocessLatex(content) {
  if (!content || typeof content !== 'string') {
    return content
  }

  // Process single $ blocks (inline math)
  // Match $...$ blocks that span multiple lines
  // Avoid matching $$ blocks by using negative lookahead/lookbehind
  content = content.replace(
    /(?<!\$)\$(?!\$)((?:[^$]|\n)+?)\$(?!\$)/g,
    (match, mathContent) => {
      // Convert newlines to LaTeX line breaks (\\)
      // But only if the line doesn't already end with \\
      const processedContent = mathContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join(' \\\\ ')

      return `$${processedContent}$`
    }
  )

  // Process double $$ blocks (display math)
  // For display math, we preserve the opening/closing $$ on their own lines
  // but add \\ between content lines
  content = content.replace(
    /\$\$([^$]+?)\$\$/g,
    (match, mathContent) => {
      // Split by newlines, trim, and filter empty lines
      const lines = mathContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      // If there's only one line, return as-is
      if (lines.length <= 1) {
        return match
      }

      // Join lines with \\ for multi-line display math
      const processedContent = lines.join(' \\\\ ')

      return `$$\n${processedContent}\n$$`
    }
  )

  return content
}
