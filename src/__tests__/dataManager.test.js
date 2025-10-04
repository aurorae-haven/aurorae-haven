/**
 * Tests for dataManager utilities, including migration logic
 */

import { migrateStorageKey, exportJSON, importJSON } from '../utils/dataManager';

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

describe('migrateStorageKey', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should migrate data from old key to new key', () => {
    // Setup: old key has data, new key is empty
    const testData = JSON.stringify({
      version: 1,
      tasks: [{ id: 1, title: 'Test Task', done: false }],
      sequences: []
    });
    localStorage.setItem('stellar_journey_data', testData);

    // Run migration
    const result = migrateStorageKey();

    // Verify migration occurred
    expect(result.migrated).toBe(true);
    expect(result.reason).toBe('migration_complete');

    // Verify data is in new key
    expect(localStorage.getItem('aurorae_haven_data')).toBe(testData);

    // Verify old key is removed
    expect(localStorage.getItem('stellar_journey_data')).toBeNull();
  });

  test('should not migrate when new key already has data', () => {
    // Setup: both keys have data
    const oldData = JSON.stringify({ version: 1, tasks: [], sequences: [] });
    const newData = JSON.stringify({ version: 2, tasks: [], sequences: [] });
    localStorage.setItem('stellar_journey_data', oldData);
    localStorage.setItem('aurorae_haven_data', newData);

    // Run migration
    const result = migrateStorageKey();

    // Verify no migration occurred
    expect(result.migrated).toBe(false);
    expect(result.reason).toBe('new_key_exists');

    // Verify new key data is unchanged
    expect(localStorage.getItem('aurorae_haven_data')).toBe(newData);

    // Verify old key is still there (not removed)
    expect(localStorage.getItem('stellar_journey_data')).toBe(oldData);
  });

  test('should handle case when neither key exists', () => {
    // Run migration with no data
    const result = migrateStorageKey();

    // Verify no migration occurred
    expect(result.migrated).toBe(false);
    expect(result.reason).toBe('no_data_found');

    // Verify no data was created
    expect(localStorage.getItem('aurorae_haven_data')).toBeNull();
    expect(localStorage.getItem('stellar_journey_data')).toBeNull();
  });

  test('should handle case when only new key exists', () => {
    // Setup: only new key has data
    const newData = JSON.stringify({ version: 1, tasks: [], sequences: [] });
    localStorage.setItem('aurorae_haven_data', newData);

    // Run migration
    const result = migrateStorageKey();

    // Verify no migration occurred
    expect(result.migrated).toBe(false);
    expect(result.reason).toBe('new_key_exists');

    // Verify new key data is unchanged
    expect(localStorage.getItem('aurorae_haven_data')).toBe(newData);
  });

  test('should handle localStorage errors gracefully', () => {
    // Mock localStorage.getItem to throw error
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = jest.fn(() => {
      throw new Error('Storage error');
    });

    // Run migration
    const result = migrateStorageKey();

    // Verify error was handled
    expect(result.migrated).toBe(false);
    expect(result.reason).toBe('error');
    expect(result.error).toBe('Storage error');

    // Restore original method
    localStorage.getItem = originalGetItem;
  });

  test('should preserve exact data structure during migration', () => {
    // Setup: complex data structure
    const complexData = {
      version: 1,
      tasks: [
        { id: 1, title: 'Task 1', done: false, priority: 'high' },
        { id: 2, title: 'Task 2', done: true, priority: 'low' }
      ],
      sequences: [
        {
          id: 'seq_1',
          name: 'Morning Routine',
          steps: [
            { label: 'Wake up', sec: 30 },
            { label: 'Breakfast', sec: 600 }
          ]
        }
      ],
      habits: [{ id: 'hab_1', name: 'Exercise', streak: 5, paused: false }],
      dumps: [{ id: 'dump_1', ts: 1234567890, text: 'Note content' }],
      schedule: [
        {
          day: '2025-01-15',
          blocks: [{ type: 'sequence', ref: 'seq_1', start: '07:00', dur_min: 30 }]
        }
      ]
    };
    localStorage.setItem('stellar_journey_data', JSON.stringify(complexData));

    // Run migration
    const result = migrateStorageKey();

    // Verify migration occurred
    expect(result.migrated).toBe(true);

    // Verify data integrity
    const migratedData = JSON.parse(localStorage.getItem('aurorae_haven_data'));
    expect(migratedData).toEqual(complexData);
  });
});

describe('exportJSON', () => {
  test('should use new filename for export', () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    // Mock DOM elements
    const mockClick = jest.fn();
    const mockRemove = jest.fn();
    let capturedDownloadName = '';
    
    const mockCreateElement = jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return {
          href: '',
          get download() { return capturedDownloadName; },
          set download(value) { capturedDownloadName = value; },
          click: mockClick,
          remove: mockRemove,
          style: {}
        };
      }
      return document.createElement(tag);
    });

    const mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});

    // Run export
    exportJSON();

    // Verify new filename is used
    expect(capturedDownloadName).toBe('aurorae_haven_data.json');
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();

    // Cleanup
    mockCreateElement.mockRestore();
    mockAppendChild.mockRestore();
  });
});

describe('importJSON', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should store imported data using new key', async () => {
    // Create mock file with text() method
    const fileContent = JSON.stringify({
      version: 1,
      tasks: [{ id: 1, title: 'Imported Task', done: false }],
      sequences: []
    });
    const mockFile = {
      text: jest.fn().mockResolvedValue(fileContent)
    };

    // Import the file
    const result = await importJSON(mockFile);

    // Verify success
    expect(result.success).toBe(true);
    expect(result.message).toBe('Data imported successfully');

    // Verify data is stored with new key
    const storedData = JSON.parse(localStorage.getItem('aurorae_haven_data'));
    expect(storedData.tasks[0].title).toBe('Imported Task');

    // Verify old key is not used
    expect(localStorage.getItem('stellar_journey_data')).toBeNull();
  });

  test('should reject invalid JSON', async () => {
    // Create mock file with invalid JSON
    const mockFile = {
      text: jest.fn().mockResolvedValue('invalid json')
    };

    // Import the file
    const result = await importJSON(mockFile);

    // Verify failure
    expect(result.success).toBe(false);
    expect(result.message).toContain('Import failed');
  });

  test('should reject data missing required fields', async () => {
    // Create mock file with incomplete data
    const fileContent = JSON.stringify({
      version: 1,
      tasks: [] // missing sequences
    });
    const mockFile = {
      text: jest.fn().mockResolvedValue(fileContent)
    };

    // Import the file
    const result = await importJSON(mockFile);

    // Verify failure
    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid schema');
  });
});
