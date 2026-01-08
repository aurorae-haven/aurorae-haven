import React from 'react'
import Icon from '../components/common/Icon'

function Schedule() {
  return (
    <>
      <div className='card'>
        <div className='card-h'>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <strong>Schedule</strong>
            <span className='small'>Today · Tue Sep 16, 2025</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className='btn'>Day</button>
            <button className='btn'>Week</button>
            <button className='btn'>
              <Icon name='plus' /> Routine
            </button>
            <button className='btn'>
              <Icon name='plus' /> Task
            </button>
            <button className='btn'>
              <Icon name='plus' /> Meeting
            </button>
          </div>
        </div>
        <div className='card-b layout-schedule'>
          <aside className='sidebar'>
            <div className='card'>
              <div className='card-h'>
                <strong>Today&apos;s queue</strong>
              </div>
              <div className='card-b'>
                <div className='list'>
                  <div className='list-row'>
                    <span>Deep Work Warmup</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='card' style={{ marginTop: '12px' }}>
              <div className='card-h'>
                <strong>Tasks</strong>
              </div>
              <div className='card-b'>
                <div className='list'>
                  <div className='list-row'>
                    <span>Buy groceries</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
          <section>
            <div className='calendar'>
              <div className='hours'>
                <div className='hour-col'>
                  <div className='h'>06:00</div>
                  <div className='h'>07:00</div>
                  <div className='h'>08:00</div>
                  <div className='h'>09:00</div>
                  <div className='h'>10:00</div>
                  <div className='h'>11:00</div>
                  <div className='h'>12:00</div>
                  <div className='h'>13:00</div>
                  <div className='h'>14:00</div>
                  <div className='h'>15:00</div>
                  <div className='h'>16:00</div>
                  <div className='h'>17:00</div>
                  <div className='h'>18:00</div>
                  <div className='h'>19:00</div>
                  <div className='h'>20:00</div>
                  <div className='h'>21:00</div>
                </div>
                <div className='slots' style={{ height: '1472px' }}>
                  <div
                    className='block routine'
                    style={{ top: '98px', height: '46px' }}
                    role='button'
                    tabIndex={0}
                    aria-label='Morning Launch routine, 07:00–07:30, 30% complete'
                  >
                    <div className='title'>Morning Launch</div>
                    <div className='meta'>07:00–07:30</div>
                    <div className='progress'>
                      <i style={{ width: '30%' }} />
                    </div>
                  </div>
                  <div
                    className='block task not-urgent-important'
                    style={{ top: '926px', height: '46px' }}
                    role='button'
                    tabIndex={0}
                    aria-label='Task: Buy groceries at 16:00, Not Urgent but Important'
                  >
                    <div className='title'>Buy groceries</div>
                    <div className='meta'>16:00</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default Schedule
