// Sequences Manager - Feature stub for routine/sequence management
// TODO: Implement full sequences functionality with timer integration

import { put, getAll, getById, deleteById, STORES } from './indexedDBManager'

/**
 * Create a new sequence
 * @param {object} sequence - Sequence data with steps
 * @returns {Promise<string>} Sequence ID
 */
export async function createSequence(sequence) {
  // TODO: Implement sequence validation and step validation
  const newSequence = {
    ...sequence,
    id: sequence.id || `seq_${Date.now()}`,
    timestamp: Date.now(),
    createdAt: new Date().toISOString(),
    steps: sequence.steps || [],
    totalDuration: calculateTotalDuration(sequence.steps || [])
  }
  await put(STORES.SEQUENCES, newSequence)
  return newSequence.id
}

/**
 * Get all sequences
 * @returns {Promise<Array>} Array of sequences
 */
export async function getSequences() {
  // TODO: Implement sorting by recently used, name, or duration
  return await getAll(STORES.SEQUENCES)
}

/**
 * Get sequence by ID
 * @param {string} id - Sequence ID
 * @returns {Promise<object>} Sequence data
 */
export async function getSequence(id) {
  // TODO: Add error handling for missing sequences
  return await getById(STORES.SEQUENCES, id)
}

/**
 * Update sequence
 * @param {object} sequence - Updated sequence data
 * @returns {Promise<string>} Sequence ID
 */
export async function updateSequence(sequence) {
  // TODO: Add validation and recalculate total duration
  const updated = {
    ...sequence,
    timestamp: Date.now(),
    totalDuration: calculateTotalDuration(sequence.steps || [])
  }
  await put(STORES.SEQUENCES, updated)
  return updated.id
}

/**
 * Delete sequence
 * @param {string} id - Sequence ID
 * @returns {Promise<void>}
 */
export async function deleteSequence(id) {
  // TODO: Add confirmation and cascade delete from schedule
  return await deleteById(STORES.SEQUENCES, id)
}

/**
 * Add step to sequence
 * @param {string} sequenceId - Sequence ID
 * @param {object} step - Step data
 * @returns {Promise<object>} Updated sequence
 */
export async function addStep(sequenceId, step) {
  // TODO: Implement step validation
  const sequence = await getById(STORES.SEQUENCES, sequenceId)
  if (!sequence) {
    throw new Error('Sequence not found')
  }

  const newStep = {
    ...step,
    id: step.id || `step_${Date.now()}`,
    order: sequence.steps.length,
    duration: step.duration || 60 // Default 60 seconds
  }

  sequence.steps.push(newStep)
  sequence.totalDuration = calculateTotalDuration(sequence.steps)
  sequence.timestamp = Date.now()

  await put(STORES.SEQUENCES, sequence)
  return sequence
}

/**
 * Remove step from sequence
 * @param {string} sequenceId - Sequence ID
 * @param {string} stepId - Step ID
 * @returns {Promise<object>} Updated sequence
 */
export async function removeStep(sequenceId, stepId) {
  // TODO: Implement step removal with order recalculation
  const sequence = await getById(STORES.SEQUENCES, sequenceId)
  if (!sequence) {
    throw new Error('Sequence not found')
  }

  sequence.steps = sequence.steps.filter(s => s.id !== stepId)
  sequence.steps.forEach((step, index) => {
    step.order = index
  })
  sequence.totalDuration = calculateTotalDuration(sequence.steps)
  sequence.timestamp = Date.now()

  await put(STORES.SEQUENCES, sequence)
  return sequence
}

/**
 * Reorder steps in sequence
 * @param {string} sequenceId - Sequence ID
 * @param {string} stepId - Step ID to move
 * @param {number} newOrder - New order position
 * @returns {Promise<object>} Updated sequence
 */
export async function reorderStep(sequenceId, stepId, newOrder) {
  // TODO: Implement drag-and-drop reordering logic
  const sequence = await getById(STORES.SEQUENCES, sequenceId)
  if (!sequence) {
    throw new Error('Sequence not found')
  }

  const stepIndex = sequence.steps.findIndex(s => s.id === stepId)
  if (stepIndex === -1) {
    throw new Error('Step not found')
  }

  const [step] = sequence.steps.splice(stepIndex, 1)
  sequence.steps.splice(newOrder, 0, step)
  
  sequence.steps.forEach((s, index) => {
    s.order = index
  })
  sequence.timestamp = Date.now()

  await put(STORES.SEQUENCES, sequence)
  return sequence
}

/**
 * Calculate total duration of steps
 * @param {Array} steps - Array of steps
 * @returns {number} Total duration in seconds
 */
function calculateTotalDuration(steps) {
  return steps.reduce((total, step) => total + (step.duration || 0), 0)
}

/**
 * Clone sequence as template
 * @param {string} sequenceId - Sequence ID to clone
 * @param {string} newName - Name for cloned sequence
 * @returns {Promise<string>} New sequence ID
 */
export async function cloneSequence(sequenceId, newName) {
  // TODO: Implement sequence cloning for templates
  const sequence = await getById(STORES.SEQUENCES, sequenceId)
  if (!sequence) {
    throw new Error('Sequence not found')
  }

  const cloned = {
    ...sequence,
    id: `seq_${Date.now()}`,
    name: newName || `${sequence.name} (Copy)`,
    timestamp: Date.now(),
    createdAt: new Date().toISOString()
  }

  await put(STORES.SEQUENCES, cloned)
  return cloned.id
}

/**
 * Get sequence execution state
 * @param {string} sequenceId - Sequence ID
 * @returns {object} Execution state (for timer integration)
 */
export function getSequenceState(sequenceId) {
  // TODO: Implement timer state management
  return {
    sequenceId,
    currentStepIndex: 0,
    isRunning: false,
    isPaused: false,
    elapsedTime: 0,
    startedAt: null
  }
}

/**
 * Start sequence execution
 * Initializes a sequence for execution with timer integration.
 * Returns the initial state including sequence data and execution status.
 * @param {string} sequenceId - Sequence ID
 * @returns {Promise<object>} Initial execution state with sequence data and timer info
 */
export async function startSequence(sequenceId) {
  // TODO: Implement sequence execution with timer
  const sequence = await getById(STORES.SEQUENCES, sequenceId)
  if (!sequence) {
    throw new Error('Sequence not found')
  }

  return {
    sequenceId,
    sequence,
    currentStepIndex: 0,
    isRunning: true,
    isPaused: false,
    elapsedTime: 0,
    startedAt: Date.now()
  }
}
