/**
 * Tests for file helper utilities
 */

import {
  sanitizeFilename,
  generateBrainDumpFilename,
  extractTitleFromFilename
} from '../utils/fileHelpers'

describe('fileHelpers', () => {
  describe('sanitizeFilename', () => {
    test('converts text to lowercase and replaces special characters with underscores', () => {
      expect(sanitizeFilename('Project Ideas')).toBe('project_ideas')
      expect(sanitizeFilename('Meeting Notes #1')).toBe('meeting_notes_1')
      expect(sanitizeFilename('Test/File@Name')).toBe('test_file_name')
    })

    test('limits length to maxLength parameter', () => {
      const longText =
        'This is a very long title that exceeds the maximum length'
      expect(sanitizeFilename(longText, 30)).toHaveLength(30)
      expect(sanitizeFilename(longText, 30)).toBe(
        'this_is_a_very_long_title_that'
      )
    })

    test('uses default maxLength of 30 when not specified', () => {
      const longText =
        'This is a very long title that exceeds thirty characters'
      expect(sanitizeFilename(longText)).toHaveLength(30)
    })

    test('handles empty or invalid input', () => {
      expect(sanitizeFilename('')).toBe('untitled')
      expect(sanitizeFilename(null)).toBe('untitled')
      expect(sanitizeFilename(undefined)).toBe('untitled')
    })

    test('preserves alphanumeric characters', () => {
      expect(sanitizeFilename('ABC123xyz')).toBe('abc123xyz')
    })

    test('removes Windows reserved characters', () => {
      expect(sanitizeFilename('file<name')).toBe('file_name')
      expect(sanitizeFilename('file>name')).toBe('file_name')
      expect(sanitizeFilename('file:name')).toBe('file_name')
      expect(sanitizeFilename('file"name')).toBe('file_name')
      expect(sanitizeFilename('file/name')).toBe('file_name')
      expect(sanitizeFilename('file\\name')).toBe('file_name')
      expect(sanitizeFilename('file|name')).toBe('file_name')
      expect(sanitizeFilename('file?name')).toBe('file_name')
      expect(sanitizeFilename('file*name')).toBe('file_name')
    })

    test('removes control characters', () => {
      expect(sanitizeFilename('file\x00name')).toBe('filename')
      expect(sanitizeFilename('file\x1Fname')).toBe('filename')
      expect(sanitizeFilename('file\x7Fname')).toBe('filename')
    })

    test('blocks path traversal attempts', () => {
      expect(sanitizeFilename('../etc/passwd')).toBe('etc_passwd')
      expect(sanitizeFilename('..\\windows\\system32')).toBe('windows_system32')
      expect(sanitizeFilename('test/../file')).toBe('test_file')
    })

    test('handles Windows reserved names', () => {
      expect(sanitizeFilename('CON')).toBe('file_con')
      expect(sanitizeFilename('PRN')).toBe('file_prn')
      expect(sanitizeFilename('AUX')).toBe('file_aux')
      expect(sanitizeFilename('NUL')).toBe('file_nul')
      expect(sanitizeFilename('COM1')).toBe('file_com1')
      expect(sanitizeFilename('LPT9')).toBe('file_lpt9')
    })

    test('removes leading and trailing special characters', () => {
      expect(sanitizeFilename('...filename...')).toBe('filename')
      expect(sanitizeFilename('___filename___')).toBe('filename')
      expect(sanitizeFilename('  filename  ')).toBe('filename')
      expect(sanitizeFilename('.filename')).toBe('filename')
      expect(sanitizeFilename('_filename')).toBe('filename')
    })

    test('collapses multiple consecutive underscores', () => {
      expect(sanitizeFilename('file___name')).toBe('file_name')
      expect(sanitizeFilename('a____b____c')).toBe('a_b_c')
    })

    test('handles empty result after sanitization', () => {
      expect(sanitizeFilename('...')).toBe('untitled')
      expect(sanitizeFilename('___')).toBe('untitled')
      expect(sanitizeFilename('<<<>>>')).toBe('untitled')
    })

    test('handles mixed dangerous characters', () => {
      expect(sanitizeFilename('My<File>:Name?.txt')).toBe('my_file_name_txt')
      expect(sanitizeFilename('Report|2024*Final')).toBe('report_2024_final')
    })
  })

  describe('generateBrainDumpFilename', () => {
    test('generates filename with correct format', () => {
      const filename = generateBrainDumpFilename('Project Ideas')
      expect(filename).toMatch(/^braindump_project_ideas_\d{8}_\d{4}\.md$/)
    })

    test('handles empty title', () => {
      const filename = generateBrainDumpFilename('')
      expect(filename).toMatch(/^braindump_untitled_\d{8}_\d{4}\.md$/)
    })

    test('sanitizes title in filename', () => {
      const filename = generateBrainDumpFilename('Test@File#Name')
      expect(filename).toMatch(/^braindump_test_file_name_\d{8}_\d{4}\.md$/)
    })

    test('includes current date in YYYYMMDD format', () => {
      const now = new Date()
      const expectedDate = now.toISOString().slice(0, 10).replace(/-/g, '')
      const filename = generateBrainDumpFilename('test')
      expect(filename).toContain(expectedDate)
    })

    test('includes current time in HHmm format', () => {
      const filename = generateBrainDumpFilename('test')
      const timeMatch = filename.match(/_(\d{4})\.md$/)
      expect(timeMatch).toBeTruthy()
      expect(timeMatch[1]).toHaveLength(4)
    })
  })

  describe('extractTitleFromFilename', () => {
    test('extracts title from standard Brain Dump filename', () => {
      const title = extractTitleFromFilename(
        'braindump_project_ideas_20250107_1430.md'
      )
      expect(title).toBe('project ideas')
    })

    test('removes .md extension', () => {
      const title = extractTitleFromFilename('test_note.md')
      expect(title).toBe('test note')
    })

    test('removes braindump_ prefix', () => {
      const title = extractTitleFromFilename('braindump_my_note.md')
      expect(title).toBe('my note')
    })

    test('removes date/time suffix', () => {
      const title = extractTitleFromFilename('my_note_20250107_1430.md')
      expect(title).toBe('my note')
    })

    test('converts underscores to spaces', () => {
      const title = extractTitleFromFilename('meeting_notes_jan_7.md')
      expect(title).toBe('meeting notes jan 7')
    })

    test('handles filename without prefix or suffix', () => {
      const title = extractTitleFromFilename('simple_note.md')
      expect(title).toBe('simple note')
    })

    test('handles empty or invalid input', () => {
      expect(extractTitleFromFilename('')).toBe('Imported Note')
      expect(extractTitleFromFilename(null)).toBe('Imported Note')
      expect(extractTitleFromFilename(undefined)).toBe('Imported Note')
    })

    test('handles filename without extension', () => {
      const title = extractTitleFromFilename('braindump_test_note')
      expect(title).toBe('test note')
    })
  })
})
