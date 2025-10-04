/**
 * Integration tests for BrainDump component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BrainDump from '../pages/BrainDump';

// Mock marked and DOMPurify
jest.mock('marked', () => ({
  marked: {
    parse: jest.fn((content) => `<p>${content}</p>`)
  }
}));

jest.mock('dompurify', () => {
  const sanitize = jest.fn((html) => html);
  return {
    __esModule: true,
    default: {
      sanitize
    }
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('BrainDump Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Basic functionality', () => {
    test('renders BrainDump component', () => {
      render(<BrainDump />);
      expect(screen.getByPlaceholderText('Start typing your thoughts...')).toBeInTheDocument();
    });

    test('loads saved content from localStorage on mount', () => {
      localStorage.setItem('brainDumpContent', 'Test content');
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      expect(textarea).toHaveValue('Test content');
    });

    test('saves content to localStorage on change', () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      fireEvent.change(textarea, { target: { value: 'New content' } });
      expect(localStorage.getItem('brainDumpContent')).toBe('New content');
    });

    test('renders markdown preview', async () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      fireEvent.change(textarea, { target: { value: '# Heading' } });
      
      await waitFor(() => {
        const preview = document.getElementById('preview');
        // With our mock, marked.parse wraps content in <p> tags
        expect(preview.innerHTML).toContain('<p>');
        expect(preview.innerHTML).toContain('# Heading');
      });
    });
  });

  describe('Auto-list continuation', () => {
    test('continues task list on Enter', async () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      // Type task list item
      fireEvent.change(textarea, { target: { value: '- [ ] First task' } });
      
      // Position cursor at end
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      
      // Press Enter
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      await waitFor(() => {
        expect(textarea.value).toBe('- [ ] First task\n- [ ] ');
      });
    });

    test('removes empty task list item on second Enter', async () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      // Set content with empty task list item
      fireEvent.change(textarea, { target: { value: '- [ ] First task\n- [ ] ' } });
      
      // Position cursor at end
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      
      // Press Enter
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      await waitFor(() => {
        expect(textarea.value).toBe('- [ ] First task\n');
      });
    });

    test('continues bullet list on Enter', async () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      fireEvent.change(textarea, { target: { value: '- First item' } });
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      await waitFor(() => {
        expect(textarea.value).toBe('- First item\n- ');
      });
    });

    test('removes empty bullet list item on second Enter', async () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      fireEvent.change(textarea, { target: { value: '- First item\n- ' } });
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      await waitFor(() => {
        expect(textarea.value).toBe('- First item\n');
      });
    });

    test('continues numbered list on Enter', async () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      fireEvent.change(textarea, { target: { value: '1. First item' } });
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      await waitFor(() => {
        expect(textarea.value).toBe('1. First item\n2. ');
      });
    });

    test('removes empty numbered list item on second Enter', async () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      fireEvent.change(textarea, { target: { value: '1. First item\n2. ' } });
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      await waitFor(() => {
        expect(textarea.value).toBe('1. First item\n');
      });
    });

    test('handles task list with asterisk marker', async () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      fireEvent.change(textarea, { target: { value: '* [ ] Task with asterisk' } });
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      await waitFor(() => {
        expect(textarea.value).toBe('* [ ] Task with asterisk\n* [ ] ');
      });
    });

    test('handles indented lists', async () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      fireEvent.change(textarea, { target: { value: '  - Indented item' } });
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      await waitFor(() => {
        expect(textarea.value).toBe('  - Indented item\n  - ');
      });
    });

    test('does not intercept Enter with Shift key', async () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      fireEvent.change(textarea, { target: { value: '- Item' } });
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      
      // Press Shift+Enter
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
      
      // Value should not be changed by our handler
      expect(textarea.value).toBe('- Item');
    });

    test('does not intercept Enter with Ctrl key', async () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      fireEvent.change(textarea, { target: { value: '- Item' } });
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      
      // Press Ctrl+Enter
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
      
      // Value should not be changed by our handler
      expect(textarea.value).toBe('- Item');
    });

    test('does not intercept Enter on non-list content', async () => {
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      fireEvent.change(textarea, { target: { value: 'Regular text' } });
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      // Value should not be changed by our handler
      expect(textarea.value).toBe('Regular text');
    });
  });

  describe('Clear functionality', () => {
    test('clears content on clear button click with confirmation', () => {
      window.confirm = jest.fn(() => true);
      
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      fireEvent.change(textarea, { target: { value: 'Some content' } });
      
      // Find and click clear button (trash icon button)
      const clearButton = screen.getAllByRole('button')[3]; // 4th button is clear
      fireEvent.click(clearButton);
      
      expect(textarea.value).toBe('');
      expect(localStorage.getItem('brainDumpContent')).toBeNull();
    });

    test('does not clear content if user cancels confirmation', () => {
      window.confirm = jest.fn(() => false);
      
      render(<BrainDump />);
      const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
      
      fireEvent.change(textarea, { target: { value: 'Some content' } });
      
      const clearButton = screen.getAllByRole('button')[3];
      fireEvent.click(clearButton);
      
      expect(textarea.value).toBe('Some content');
    });
  });

  describe('Export functionality', () => {
    test('exports content as markdown file', () => {
      // Store originals before mocking
      const { createObjectURL, revokeObjectURL } = global.URL;
      const originalCreateElement = document.createElement;
      
      try {
        // Mock URL.createObjectURL and revokeObjectURL
        global.URL.createObjectURL = jest.fn(() => 'blob:mock');
        global.URL.revokeObjectURL = jest.fn();
        
        // Mock createElement to spy on the download link
        const mockClick = jest.fn();
        document.createElement = jest.fn((tag) => {
          if (tag === 'a') {
            const element = originalCreateElement.call(document, tag);
            element.click = mockClick;
            return element;
          }
          return originalCreateElement.call(document, tag);
        });
        
        render(<BrainDump />);
        const textarea = screen.getByPlaceholderText('Start typing your thoughts...');
        fireEvent.change(textarea, { target: { value: 'Export this content' } });
        
        // Find and click export button
        const exportButton = screen.getAllByRole('button')[4]; // 5th button is export
        fireEvent.click(exportButton);
        
        expect(mockClick).toHaveBeenCalled();
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      } finally {
        // Restore all mocks
        global.URL.createObjectURL = createObjectURL;
        global.URL.revokeObjectURL = revokeObjectURL;
        document.createElement = originalCreateElement;
      }
    });
  });
});
