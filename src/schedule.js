// v12.3 schedule renderer: label on top + multi-line desc
document.addEventListener('DOMContentLoaded', function () {
  const calEl = document.getElementById('calendar')
  if (!calEl || !window.FullCalendar) return

  // Try to reuse existing events if page script set them; otherwise demo
  let events = []
  try {
    if (window.sjEvents && Array.isArray(window.sjEvents)) {
      events = window.sjEvents
    }
  } catch {}
  if (!events.length) {
    const stored = localStorage.getItem('sj.schedule.events')
    events = stored ? JSON.parse(stored) : []
  }
  if (!events.length) {
    events = [
      {
        id: '1',
        title: 'Exemple',
        start: '2025-09-19T09:00:00',
        end: '2025-09-19T10:00:00',
        extendedProps: {
          label: 'Demo',
          description: 'Description de démonstration multi-lignes.'
        }
      }
    ]
  }

  const calendar = new FullCalendar.Calendar(calEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events,
    eventDisplay: 'block',
    eventContent(arg) {
      const { timeText, event } = arg
      const labelText = event.extendedProps?.label || null
      const descText = event.extendedProps?.description || null
      const frags = []
      if (labelText) {
        const label = document.createElement('div')
        label.className = 'sj-label'
        label.textContent = labelText
        frags.push({ domNodes: [label] })
      }
      const title = document.createElement('div')
      title.className = 'fc-event-title'
      title.textContent = event.title || ''
      frags.push({ domNodes: [title] })
      if (timeText) {
        const time = document.createElement('div')
        time.className = 'sj-time'
        time.textContent = timeText
        frags.push({ domNodes: [time] })
      }
      if (descText) {
        const desc = document.createElement('div')
        desc.className = 'sj-desc'
        desc.textContent = descText
        frags.push({ domNodes: [desc] })
      }
      return frags
    },
    eventDidMount(info) {
      const fullDesc = info.event.extendedProps?.description
      if (fullDesc && info.el) {
        info.el.setAttribute('title', fullDesc)
        info.el.setAttribute('aria-label', fullDesc)
      }
    }
  })
  calendar.render()
})
