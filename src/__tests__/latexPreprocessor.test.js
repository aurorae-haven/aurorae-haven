/**
 * Tests for LaTeX Preprocessor
 * Validates that LaTeX content is properly preprocessed for line breaks
 */

import { preprocessLatex } from '../utils/latexPreprocessor'

describe('LaTeX Preprocessor', () => {
  describe('preprocessLatex', () => {
    test('handles null and undefined', () => {
      expect(preprocessLatex(null)).toBeNull()
      expect(preprocessLatex(undefined)).toBeUndefined()
    })

    test('handles empty string', () => {
      expect(preprocessLatex('')).toBe('')
    })

    test('handles non-LaTeX content', () => {
      const content = 'This is plain markdown text'
      expect(preprocessLatex(content)).toBe(content)
    })

    test('handles single line LaTeX', () => {
      const content = '$\\phi = x$'
      expect(preprocessLatex(content)).toBe('$\\phi = x$')
    })

    describe('Single $ blocks (inline math)', () => {
      test('converts newlines to LaTeX line breaks', () => {
        const content = `$
\\phi = x 
\\alpha = y 
$`
        const result = preprocessLatex(content)
        expect(result).toContain('\\\\')
        expect(result).not.toContain('\n')
        expect(result).toBe('$\\phi = x \\\\ \\alpha = y$')
      })

      test('handles multiple equations with newlines', () => {
        const content = `$
\\phi = x
\\alpha = y
\\beta = z
$`
        const result = preprocessLatex(content)
        expect(result).toBe('$\\phi = x \\\\ \\alpha = y \\\\ \\beta = z$')
      })

      test('trims whitespace from lines', () => {
        const content = `$
  \\phi = x  
  \\alpha = y  
$`
        const result = preprocessLatex(content)
        expect(result).toBe('$\\phi = x \\\\ \\alpha = y$')
      })

      test('removes empty lines', () => {
        const content = `$
\\phi = x

\\alpha = y
$`
        const result = preprocessLatex(content)
        expect(result).toBe('$\\phi = x \\\\ \\alpha = y$')
      })

      test('preserves single $ blocks on one line', () => {
        const content = '$\\phi = x \\alpha = y$'
        expect(preprocessLatex(content)).toBe('$\\phi = x \\alpha = y$')
      })

      test('handles multiple single $ blocks in content', () => {
        const content = `Some text $
\\phi = x
\\alpha = y
$ and more text $
\\beta = z
\\gamma = w
$`
        const result = preprocessLatex(content)
        expect(result).toContain('$\\phi = x \\\\ \\alpha = y$')
        expect(result).toContain('$\\beta = z \\\\ \\gamma = w$')
        expect(result).toContain('and more text')
      })
    })

    describe('Double $$ blocks (display math)', () => {
      test('converts newlines to LaTeX line breaks in display math', () => {
        const content = `$$
\\phi = x
\\alpha = y
$$`
        const result = preprocessLatex(content)
        expect(result).toContain('\\\\')
        expect(result).toBe('$$\n\\phi = x \\\\ \\alpha = y\n$$')
      })

      test('preserves single line display math', () => {
        const content = '$$\\phi = x$$'
        expect(preprocessLatex(content)).toBe('$$\\phi = x$$')
      })

      test('handles multiple lines in display math', () => {
        const content = `$$
\\phi = x
\\alpha = y
\\beta = z
$$`
        const result = preprocessLatex(content)
        expect(result).toBe(
          '$$\n\\phi = x \\\\ \\alpha = y \\\\ \\beta = z\n$$'
        )
      })

      test('handles empty lines in display math', () => {
        const content = `$$
\\phi = x

\\alpha = y
$$`
        const result = preprocessLatex(content)
        expect(result).toBe('$$\n\\phi = x \\\\ \\alpha = y\n$$')
      })

      test('handles multiple $$ blocks in content', () => {
        const content = `Text before
$$
\\phi = x
\\alpha = y
$$
Text between
$$
\\beta = z
\\gamma = w
$$
Text after`
        const result = preprocessLatex(content)
        expect(result).toContain('$$\n\\phi = x \\\\ \\alpha = y\n$$')
        expect(result).toContain('$$\n\\beta = z \\\\ \\gamma = w\n$$')
        expect(result).toContain('Text before')
        expect(result).toContain('Text between')
        expect(result).toContain('Text after')
      })
    })

    describe('Mixed content', () => {
      test('handles both single and double $ blocks', () => {
        const content = `Some text with $
\\phi = x
\\alpha = y
$ inline and also

$$
\\beta = z
\\gamma = w
$$

display math`
        const result = preprocessLatex(content)
        expect(result).toContain('$\\phi = x \\\\ \\alpha = y$')
        expect(result).toContain('$$\n\\beta = z \\\\ \\gamma = w\n$$')
      })

      test('handles LaTeX mixed with regular markdown', () => {
        const content = `# Heading

Some text

$
\\phi = x
\\alpha = y
$

More text

$$
\\beta = z
$$

Final text`
        const result = preprocessLatex(content)
        expect(result).toContain('# Heading')
        expect(result).toContain('$\\phi = x \\\\ \\alpha = y$')
        // Single line display math is preserved with newlines around it
        expect(result).toMatch(/\$\$[\n\s]*\\beta = z[\n\s]*\$\$/)
      })
    })

    describe('Edge cases', () => {
      test('handles $ in regular text (escaped)', () => {
        const content = 'This costs \\$10.00 and \\$20.00'
        expect(preprocessLatex(content)).toBe(content)
      })

      test('handles unmatched $', () => {
        const content = 'Some text $ incomplete'
        // Should not crash, but may not process correctly
        expect(() => preprocessLatex(content)).not.toThrow()
      })

      test('handles nested content (but not nested math)', () => {
        const content = `$
\\text{This is } x
\\text{This is } y
$`
        const result = preprocessLatex(content)
        expect(result).toContain('\\\\')
      })

      test('handles complex LaTeX commands', () => {
        const content = `$
\\frac{a}{b}
\\sqrt{x}
$`
        const result = preprocessLatex(content)
        expect(result).toBe('$\\frac{a}{b} \\\\ \\sqrt{x}$')
      })
    })

    describe('Original issue test case', () => {
      test('fixes the reported issue', () => {
        const content = `$
\\phi = x 
\\alpha = y 
$`
        const result = preprocessLatex(content)
        // Should convert to single line with LaTeX line breaks
        expect(result).toBe('$\\phi = x \\\\ \\alpha = y$')
        // Should not contain actual newlines in the math block
        expect(result).not.toMatch(/\$\n/)
      })
    })
  })
})
