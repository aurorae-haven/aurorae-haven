import React from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import { getCategoryColor } from '../../utils/habitCategories'

/**
 * HabitDetailDrawer - Expanded view with full history and vacation mode
 * TAB-HAB-26: Detail drawer with full history
 * TAB-HAB-27: Completion history with filters
 * TAB-HAB-28: Vacation toggle
 */
function HabitDetailDrawer({ habit, onClose }) {
  if (!habit) return null

  const categoryColor = getCategoryColor(habit.category)
  const completions = habit.completions || []
  const vacationDates = habit.vacationDates || []

  // Generate 90-day heatmap
  const generateHeatmap = () => {
    const today = dayjs()
    const days = []
    
    for (let i = 89; i >= 0; i--) {
      const date = today.subtract(i, 'day')
      const dateStr = date.format('YYYY-MM-DD')
      const isCompleted = completions.some(c => c.date === dateStr)
      const isVacation = vacationDates.includes(dateStr)
      
      days.push({
        date: dateStr,
        display: date.format('MMM D'),
        isCompleted,
        isVacation,
        isToday: date.isSame(today, 'day')
      })
    }
    
    return days
  }

  const heatmapDays = generateHeatmap()
  
  // Group by week for better layout
  const weeks = []
  for (let i = 0; i < heatmapDays.length; i += 7) {
    weeks.push(heatmapDays.slice(i, i + 7))
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '500px',
        maxWidth: '90vw',
        backgroundColor: '#1a1d2e',
        borderLeft: '1px solid #3d4263',
        boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        overflowY: 'auto',
        padding: '1.5rem'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {habit.category && habit.category !== 'default' && (
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: categoryColor.bg
              }} />
            )}
            <h2 style={{ margin: 0 }}>{habit.name}</h2>
          </div>
          {habit.paused && (
            <span className='small' style={{ color: '#f2c94c' }}>⏸️ Paused</span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#eef0ff',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
          aria-label='Close drawer'
        >
          ✕
        </button>
      </div>

      {/* Stats */}
      <div className='card-b' style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <div className='small' style={{ color: '#a9b1e0', marginBottom: '0.25rem' }}>Current Streak</div>
            <strong style={{ fontSize: '1.5rem' }}>🔥 {habit.streak || 0} days</strong>
          </div>
          <div>
            <div className='small' style={{ color: '#a9b1e0', marginBottom: '0.25rem' }}>Best Streak</div>
            <strong style={{ fontSize: '1.5rem' }}>⭐ {habit.longestStreak || 0} days</strong>
          </div>
          <div>
            <div className='small' style={{ color: '#a9b1e0', marginBottom: '0.25rem' }}>Total Completions</div>
            <strong style={{ fontSize: '1.5rem' }}>{completions.length}</strong>
          </div>
          <div>
            <div className='small' style={{ color: '#a9b1e0', marginBottom: '0.25rem' }}>XP Earned</div>
            <strong style={{ fontSize: '1.5rem' }}>✨ {habit.xp || 0}</strong>
          </div>
        </div>
      </div>

      {/* 90-Day Heatmap */}
      <div className='card-b' style={{ marginBottom: '1.5rem' }}>
        <strong style={{ display: 'block', marginBottom: '1rem' }}>Last 90 Days</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} style={{ display: 'flex', gap: '4px' }}>
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    backgroundColor: day.isVacation ? '#3d4263' : (day.isCompleted ? '#86f5e0' : '#1a1d2e'),
                    border: day.isToday ? '2px solid #86f5e0' : '1px solid #2a2e47',
                    backgroundImage: day.isVacation ? 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' : 'none'
                  }}
                  title={`${day.display}: ${day.isCompleted ? 'Completed' : day.isVacation ? 'Vacation' : 'Not done'}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#86f5e0' }} />
            <span className='small'>Completed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#1a1d2e', border: '1px solid #2a2e47' }} />
            <span className='small'>Not done</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              backgroundColor: '#3d4263',
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
            }} />
            <span className='small'>Vacation</span>
          </div>
        </div>
      </div>

      {/* Recent History */}
      <div className='card-b'>
        <strong style={{ display: 'block', marginBottom: '1rem' }}>Recent Completions</strong>
        {completions.length === 0 ? (
          <p className='small' style={{ color: '#a9b1e0' }}>No completions yet. Start your streak today!</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {[...completions].reverse().slice(0, 30).map((completion, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.5rem',
                  borderBottom: idx < Math.min(completions.length, 30) - 1 ? '1px solid #2a2e47' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{dayjs(completion.date).format('MMM D, YYYY')}</span>
                <span className='small' style={{ color: '#86f5e0' }}>✓ Completed</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

HabitDetailDrawer.propTypes = {
  habit: PropTypes.object,
  onClose: PropTypes.func.isRequired
}

export default HabitDetailDrawer
