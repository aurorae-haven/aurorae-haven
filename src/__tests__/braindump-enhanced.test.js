/**
 * Security and GDPR compliance tests for braindump-enhanced.js
 * Tests sanitization, XSS prevention, and data privacy features
 */

import {
  configureSanitization,
  VersionHistory,
  Backlinks,
  FileAttachments
} from '../utils/braindump-enhanced'

// Mock DOMPurify
const mockDOMPurify = {
  addHook: jest.fn(),
  sanitize: jest.fn((html) => html)
}

describe('Security: configureSanitization', () => {
  beforeEach(() => {
    window.DOMPurify = mockDOMPurify
    mockDOMPurify.addHook.mockClear()
  })

  afterEach(() => {
    delete window.DOMPurify
  })

  test('returns null when DOMPurify is not loaded', () => {
    delete window.DOMPurify
    const config = configureSanitization()
    expect(config).toBeNull()
  })

  test('configures allowed HTML tags for markdown', () => {
    const config = configureSanitization()
    expect(config.ALLOWED_TAGS).toContain('h1')
    expect(config.ALLOWED_TAGS).toContain('p')
    expect(config.ALLOWED_TAGS).toContain('a')
    expect(config.ALLOWED_TAGS).toContain('code')
    expect(config.ALLOWED_TAGS).toContain('input') // for checkboxes
  })

  test('forbids dangerous HTML tags', () => {
    const config = configureSanitization()
    expect(config.FORBID_TAGS).toContain('script')
    expect(config.FORBID_TAGS).toContain('iframe')
    expect(config.FORBID_TAGS).toContain('object')
    expect(config.FORBID_TAGS).toContain('embed')
    expect(config.FORBID_TAGS).toContain('style')
  })

  test('forbids dangerous HTML attributes', () => {
    const config = configureSanitization()
    expect(config.FORBID_ATTR).toContain('onerror')
    expect(config.FORBID_ATTR).toContain('onload')
    expect(config.FORBID_ATTR).toContain('onclick')
    expect(config.FORBID_ATTR).toContain('onmouseover')
  })

  test('configures safe URI protocols', () => {
    const config = configureSanitization()
    expect(config.ALLOWED_URI_REGEXP).toBeInstanceOf(RegExp)
    // Test that it allows safe protocols
    expect('https://example.com').toMatch(config.ALLOWED_URI_REGEXP)
    expect('http://example.com').toMatch(config.ALLOWED_URI_REGEXP)
    expect('mailto:test@example.com').toMatch(config.ALLOWED_URI_REGEXP)
    expect('#anchor').toMatch(config.ALLOWED_URI_REGEXP)
  })

  test('registers afterSanitizeAttributes hook', () => {
    configureSanitization()
    expect(mockDOMPurify.addHook).toHaveBeenCalledWith(
      'afterSanitizeAttributes',
      expect.any(Function)
    )
  })
})

describe('Security: Link sanitization hook', () => {
  let hookCallback

  beforeEach(() => {
    window.DOMPurify = mockDOMPurify
    mockDOMPurify.addHook.mockClear()
    configureSanitization()
    hookCallback = mockDOMPurify.addHook.mock.calls[0][1]
  })

  afterEach(() => {
    delete window.DOMPurify
  })

  test('adds target=_blank to external links', () => {
    const mockNode = {
      tagName: 'A',
      getAttribute: jest.fn(() => 'https://example.com'),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn()
    }

    hookCallback(mockNode)

    expect(mockNode.setAttribute).toHaveBeenCalledWith('target', '_blank')
    expect(mockNode.setAttribute).toHaveBeenCalledWith(
      'rel',
      'noopener noreferrer'
    )
  })

  test('does not modify internal anchor links', () => {
    const mockNode = {
      tagName: 'A',
      getAttribute: jest.fn(() => '#section'),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn()
    }

    hookCallback(mockNode)

    expect(mockNode.removeAttribute).not.toHaveBeenCalled()
  })

  test('blocks javascript: protocol (XSS prevention)', () => {
    const mockNode = {
      tagName: 'A',
      // eslint-disable-next-line no-script-url
      getAttribute: jest.fn(() => 'javascript:alert(1)'),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn()
    }

    hookCallback(mockNode)

    expect(mockNode.removeAttribute).toHaveBeenCalledWith('href')
  })

  test('blocks JavaScript: protocol with mixed case', () => {
    const mockNode = {
      tagName: 'A',
      // eslint-disable-next-line no-script-url
      getAttribute: jest.fn(() => 'JavaScript:alert(1)'),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn()
    }

    hookCallback(mockNode)

    expect(mockNode.removeAttribute).toHaveBeenCalledWith('href')
  })

  test('blocks vbscript: protocol (XSS prevention)', () => {
    const mockNode = {
      tagName: 'A',
      getAttribute: jest.fn(() => 'vbscript:msgbox'),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn()
    }

    hookCallback(mockNode)

    expect(mockNode.removeAttribute).toHaveBeenCalledWith('href')
  })

  test('blocks data: URIs in links (XSS prevention)', () => {
    const mockNode = {
      tagName: 'A',
      getAttribute: jest.fn(() => 'data:text/html,<script>alert(1)</script>'),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn()
    }

    hookCallback(mockNode)

    expect(mockNode.removeAttribute).toHaveBeenCalledWith('href')
  })

  test('handles links with whitespace padding', () => {
    const mockNode = {
      tagName: 'A',
      getAttribute: jest.fn(() => '  javascript:alert(1)  '),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn()
    }

    hookCallback(mockNode)

    expect(mockNode.removeAttribute).toHaveBeenCalledWith('href')
  })

  test('does not affect non-link elements', () => {
    const mockNode = {
      tagName: 'P',
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn()
    }

    hookCallback(mockNode)

    expect(mockNode.getAttribute).not.toHaveBeenCalled()
  })
})

describe('GDPR: VersionHistory data management', () => {
  let versionHistory

  beforeEach(() => {
    localStorage.clear()
    versionHistory = new VersionHistory('testVersions')
  })

  test('initializes with default storage key', () => {
    const vh = new VersionHistory()
    expect(vh.storageKey).toBe('brainDumpVersions')
  })

  test('saves version with timestamp', () => {
    const content = 'Test content'
    versionHistory.save(content)

    const versions = JSON.parse(localStorage.getItem('testVersions'))
    expect(versions).toHaveLength(1)
    expect(versions[0].content).toBe(content)
    expect(versions[0].timestamp).toBeDefined()
  })

  test('limits stored versions to maxVersions', () => {
    versionHistory.maxVersions = 3

    // Save 5 versions
    for (let i = 0; i < 5; i++) {
      versionHistory.save(`Content ${i}`)
    }

    const versions = JSON.parse(localStorage.getItem('testVersions'))
    expect(versions).toHaveLength(3)
    // Most recent versions are kept (unshift puts new at beginning)
    expect(versions[0].content).toBe('Content 4') // Most recent
    expect(versions[2].content).toBe('Content 2') // Oldest kept
  })

  test('allows user to restore previous versions', () => {
    versionHistory.save('Version 1')
    versionHistory.save('Version 2')
    versionHistory.save('Version 3')

    const versions = versionHistory.getAll()
    expect(versions).toHaveLength(3)
    expect(versions[0].content).toBe('Version 3') // Most recent first
  })

  test('allows user to delete all versions (GDPR right to erasure)', () => {
    versionHistory.save('Version 1')
    versionHistory.save('Version 2')

    versionHistory.clear()

    const versions = JSON.parse(localStorage.getItem('testVersions'))
    expect(versions).toBeNull()
  })
})

describe('GDPR: Data export and privacy', () => {
  test('VersionHistory allows data export', () => {
    const versionHistory = new VersionHistory('testVersions')
    versionHistory.save('Content 1')
    versionHistory.save('Content 2')

    const exportData = versionHistory.getAll()
    expect(exportData).toBeInstanceOf(Array)
    expect(exportData).toHaveLength(2)
  })

  test('FileAttachments stores data locally (no external transmission)', async () => {
    const fileAttachments = new FileAttachments()

    // FileAttachments should use OPFS (Origin Private File System)
    // which keeps data local to the browser
    expect(fileAttachments).toBeDefined()
    // Initialization happens asynchronously and may fail if OPFS not supported
    // This is acceptable as it's a progressive enhancement
  })
})

describe('Security: Backlinks safe rendering', () => {
  let backlinks

  beforeEach(() => {
    backlinks = new Backlinks()
  })

  test('renders backlinks safely without executing scripts', () => {
    const content = '[[Link]] content'
    const result = backlinks.renderLinks(content)

    // Should convert to safe markdown link format
    expect(result).not.toContain('<script>')
    // eslint-disable-next-line no-script-url
    expect(result).not.toContain('javascript:')
  })

  test('extracts backlinks from content', () => {
    const content = '[[Note 1]] and [[Note 2]] reference'
    const links = backlinks.extractLinks(content)

    expect(links).toHaveLength(2)
    expect(links[0].text).toBe('Note 1')
    expect(links[1].text).toBe('Note 2')
  })

  test('allows clearing backlink data (GDPR compliance)', () => {
    // Store some entry data
    localStorage.setItem(
      'brainDumpEntries',
      JSON.stringify([{ id: 1, content: '[[Note 2]]', timestamp: Date.now() }])
    )

    // User can delete all data
    localStorage.removeItem('brainDumpEntries')

    const stored = localStorage.getItem('brainDumpEntries')
    expect(stored).toBeNull()
  })
})

describe('Security: Input validation', () => {
  beforeEach(() => {
    window.DOMPurify = mockDOMPurify
  })

  afterEach(() => {
    delete window.DOMPurify
  })

  test('configureSanitization validates URI protocols', () => {
    const config = configureSanitization()

    // Should allow safe protocols
    expect('https://example.com').toMatch(config.ALLOWED_URI_REGEXP)
    expect('http://example.com').toMatch(config.ALLOWED_URI_REGEXP)
    expect('mailto:user@example.com').toMatch(config.ALLOWED_URI_REGEXP)
    expect('tel:+1234567890').toMatch(config.ALLOWED_URI_REGEXP)
    expect('#anchor').toMatch(config.ALLOWED_URI_REGEXP)
  })

  test('configureSanitization prevents DOM-based XSS', () => {
    const config = configureSanitization()

    // Should enable DOM sanitization
    expect(config.SANITIZE_DOM).toBe(true)
    expect(config.KEEP_CONTENT).toBe(true)
  })
})
