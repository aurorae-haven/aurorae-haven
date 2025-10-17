// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom'

// Mock logger to avoid import issues in tests
/* global jest */
jest.mock('./utils/logger')

// Polyfill for structuredClone (needed for fake-indexeddb in Node.js < 17)
/* global global:writable */
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => {
    return JSON.parse(JSON.stringify(obj))
  }
}
