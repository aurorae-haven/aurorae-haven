import React, { useState, useEffect } from 'react'
import {
  getHabits,
  toggleHabitToday,
  getTodayStats,
  createHabit,
  deleteHabit,
  pauseHabit
} from '../utils/habitsManager'
import Toast from '../components/Toast'
import HeatmapStrip from '../components/Habits/HeatmapStrip'
import FilterModal from '../components/Habits/FilterModal'
import HabitDetailDrawer from '../components/Habits/HabitDetailDrawer'
import { createLogger } from '../utils/logger'
import { getCategoryColor, CATEGORY_OPTIONS } from '../utils/habitCategories'

const logger = createLogger('Habits')

/**
 * Habits Page - TAB-HAB Implementation
 * Core habit tracking with streaks, XP, and gamification
 */
function Habits() {
  const [habits, setHabits] = useState([])
  const [todayStats, setTodayStats] = useState({ total: 0, completed: 0, percentage: 0 })
  const [loading, setLoading] = useState(true)
  const [showNewHabitModal, setShowNewHabitModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [toast, setToast] = useState(null)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitCategory, setNewHabitCategory] = useState('default')
  const [sortBy, setSortBy] = useState('title')
  const [filters, setFilters] = useState({})

  useEffect(() => {
    loadHabits()
  }, [sortBy, filters])

  const loadHabits = async () => {
    try {
      setLoading(true)
      let allHabits = await getHabits({ sortBy })
      
      // Apply filters
      if (filters.category) {
        allHabits = allHabits.filter(h => h.category === filters.category)
      }
      if (filters.status === 'active') {
        allHabits = allHabits.filter(h => !h.paused)
      } else if (filters.status === 'paused') {
        allHabits = allHabits.filter(h => h.paused)
      } else if (filters.status === 'completed-today') {
        const today = new Date().toISOString().split('T')[0]
        allHabits = allHabits.filter(h => h.completions?.some(c => c.date === today))
      } else if (filters.status === 'incomplete-today') {
        const today = new Date().toISOString().split('T')[0]
        allHabits = allHabits.filter(h => !h.completions?.some(c => c.date === today))
      }
      
      const stats = await getTodayStats()
      setHabits(allHabits)
      setTodayStats(stats)
    } catch (error) {
      logger.error('Failed to load habits:', error)
      showToast('Failed to load habits', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleHabit = async (habitId) => {
    try {
      const result = await toggleHabitToday(habitId)
      await loadHabits()
      
      if (result.xpEarned > 0) {
        showToast(result.message, 'success')
      }
    } catch (error) {
      logger.error('Failed to toggle habit:', error)
      showToast('Failed to update habit', 'error')
    }
  }

  const handleCreateHabit = async (e) => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    try {
      await createHabit({ 
        name: newHabitName,
        category: newHabitCategory
      })
      setNewHabitName('')
      setNewHabitCategory('default')
      setShowNewHabitModal(false)
      await loadHabits()
      showToast('Habit created successfully', 'success')
    } catch (error) {
      logger.error('Failed to create habit:', error)
      showToast('Failed to create habit', 'error')
    }
  }

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return

    try {
      await deleteHabit(habitId)
      await loadHabits()
      showToast('Habit deleted', 'success')
    } catch (error) {
      logger.error('Failed to delete habit:', error)
      showToast('Failed to delete habit', 'error')
    }
  }

  const handlePauseHabit = async (habitId, isPaused) => {
    try {
      await pauseHabit(habitId, !isPaused)
      await loadHabits()
      showToast(isPaused ? 'Habit resumed' : 'Habit paused', 'success')
    } catch (error) {
      logger.error('Failed to pause habit:', error)
      showToast('Failed to update habit', 'error')
    }
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className='card'>
        <div className='card-h'>
          <strong>Habits</strong>
        </div>
        <div className='card-b'>
          <p>Loading habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='habits-container'>
      {/* TAB-HAB-10: Today Panel with completion ring */}
      <div className='card' style={{ marginBottom: '1rem' }}>
        <div className='card-h'>
          <strong>Today&apos;s Progress</strong>
          <span className='small'>Track your daily habits</span>
        </div>
        <div className='card-b'>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%',
              border: '8px solid #2a2e47',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              background: `conic-gradient(#86f5e0 ${todayStats.percentage}%, transparent ${todayStats.percentage}%)`
            }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: '#1a1d2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <strong style={{ fontSize: '24px' }}>{todayStats.completed}/{todayStats.total}</strong>
                <span className='small'>habits</span>
              </div>
            </div>
            <div>
              <p><strong>{todayStats.percentage}%</strong> complete</p>
              <p className='small'>
                {todayStats.remaining} habit{todayStats.remaining !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TAB-HAB-03: Toolbar */}
      <div className='card' style={{ marginBottom: '1rem' }}>
        <div className='card-h' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Habits ({habits.length})</strong>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowFilterModal(true)}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                background: '#2a2e47',
                border: '1px solid #3d4263',
                color: '#eef0ff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🔍 Filter
              {(filters.category || filters.status) && (
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#86f5e0'
                }} />
              )}
            </button>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#2a2e47', border: '1px solid #3d4263', color: '#eef0ff' }}
            >
              <option value='title'>Sort: Title</option>
              <option value='currentStreak'>Sort: Current Streak</option>
              <option value='longestStreak'>Sort: Longest Streak</option>
              <option value='lastCompleted'>Sort: Last Done</option>
            </select>
            <button 
              onClick={() => setShowNewHabitModal(true)}
              style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', background: '#86f5e0', color: '#1a1d2e', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + New Habit
            </button>
          </div>
        </div>
      </div>

      {/* TAB-HAB-01: Habit List */}
      {habits.length === 0 ? (
        <div className='card'>
          <div className='card-b'>
            <p>No habits yet. Create your first habit to get started!</p>
          </div>
        </div>
      ) : (
        habits.map(habit => (
          <div 
            key={habit.id} 
            className='card' 
            style={{ marginBottom: '1rem', opacity: habit.paused ? 0.6 : 1, cursor: 'pointer' }} 
            onClick={() => setSelectedHabit(habit)}
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedHabit(habit) }}
            role='button'
            tabIndex={0}
            aria-label={`View details for ${habit.name}`}
          >
            <div className='card-b'>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }} onClick={(e) => e.stopPropagation()} onKeyPress={(e) => e.stopPropagation()} role='presentation'>
                  {/* TAB-HAB-08: Today tick control */}
                  <input
                    type='checkbox'
                    checked={habit.lastCompleted === getTodayDate()}
                    onChange={() => handleToggleHabit(habit.id)}
                    disabled={habit.paused}
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      cursor: habit.paused ? 'not-allowed' : 'pointer',
                      accentColor: '#86f5e0'
                    }}
                    aria-label={`Complete ${habit.name}`}
                  />
                  
                  <div 
                    style={{ flex: 1 }} 
                    onClick={() => setSelectedHabit(habit)}
                    onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedHabit(habit) }}
                    role='button'
                    tabIndex={0}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {/* TAB-HAB-07, TAB-HAB-34: Category color chip */}
                      {habit.category && habit.category !== 'default' && (
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getCategoryColor(habit.category).bg,
                          flexShrink: 0
                        }} />
                      )}
                      <strong>{habit.name}</strong>
                      {habit.paused && <span className='small' style={{ color: '#f2c94c' }}>(Paused)</span>}
                    </div>
                    {/* TAB-HAB-08: Streak counter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span className='small'>🔥 {habit.streak || 0} day streak</span>
                      {habit.longestStreak > 0 && habit.longestStreak > habit.streak && (
                        <span className='small' style={{ color: '#a9b1e0' }}>
                          (Best: {habit.longestStreak})
                        </span>
                      )}
                    </div>
                    {/* TAB-HAB-09: Compact heatmap strip */}
                    <HeatmapStrip 
                      completions={habit.completions || []}
                      vacationDates={habit.vacationDates || []}
                      daysToShow={28}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handlePauseHabit(habit.id, habit.paused)}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#2a2e47', color: '#eef0ff', border: '1px solid #3d4263', cursor: 'pointer', fontSize: '0.875rem' }}
                    aria-label={habit.paused ? 'Resume habit' : 'Pause habit'}
                  >
                    {habit.paused ? '▶️' : '⏸️'}
                  </button>
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#2a2e47', color: '#ff5555', border: '1px solid #3d4263', cursor: 'pointer', fontSize: '0.875rem' }}
                    aria-label='Delete habit'
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* TAB-HAB-11: New Habit Modal */}
      {showNewHabitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className='card' style={{ width: '90%', maxWidth: '500px' }}>
            <div className='card-h'>
              <strong>Create New Habit</strong>
            </div>
            <div className='card-b'>
              <form onSubmit={handleCreateHabit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor='habit-name' style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Habit Name <span style={{ color: '#ff5555' }}>*</span>
                  </label>
                  <input
                    id='habit-name'
                    type='text'
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder='e.g., Morning Exercise'
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      borderRadius: '4px', 
                      background: '#2a2e47', 
                      border: '1px solid #3d4263', 
                      color: '#eef0ff' 
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor='habit-category' style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Category
                  </label>
                  <select
                    id='habit-category'
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      borderRadius: '4px', 
                      background: '#2a2e47', 
                      border: '1px solid #3d4263', 
                      color: '#eef0ff' 
                    }}
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    type='button'
                    onClick={() => {
                      setShowNewHabitModal(false)
                      setNewHabitName('')
                      setNewHabitCategory('default')
                    }}
                    style={{ padding: '0.5rem 1rem', borderRadius: '4px', background: '#2a2e47', color: '#eef0ff', border: '1px solid #3d4263', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={!newHabitName.trim()}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      borderRadius: '4px', 
                      background: newHabitName.trim() ? '#86f5e0' : '#3d4263', 
                      color: '#1a1d2e', 
                      border: 'none', 
                      cursor: newHabitName.trim() ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold'
                    }}
                  >
                    Create Habit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      {/* TAB-HAB-04: Filter Modal */}
      {showFilterModal && (
        <FilterModal
          filters={filters}
          onApply={setFilters}
          onClose={() => setShowFilterModal(false)}
        />
      )}
      
      {/* TAB-HAB-26: Habit Detail Drawer */}
      {selectedHabit && (
        <HabitDetailDrawer
          habit={selectedHabit}
          onClose={() => setSelectedHabit(null)}
        />
      )}
    </div>
  )
}

export default Habits
