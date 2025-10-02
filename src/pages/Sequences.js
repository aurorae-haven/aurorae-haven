import React from 'react';

function Sequences() {
  return (
    <>
      {/* Runner on top with larger current step */}
      <div className="card">
        <div className="card-h">
          <strong>Runner</strong>
          <span className="small">Focus on current step</span>
        </div>
        <div className="card-b runner-top">
          <div className="seq-time">
            <div className="small">Sequence timer</div>
            <div style={{ fontWeight: '700' }}>00:07:42</div>
          </div>
          <div className="triptych">
            <div className="panel dim">
              <div className="step-title">Water</div>
              <div className="step-meta">
                <span className="small">Actual</span>
                <span className="small">00:00:24</span>
              </div>
            </div>
            <div className="panel">
              <div className="step-title">Meds</div>
              <div className="step-meta">
                <span className="small">Timer</span>
                <span className="small">01:06</span>
              </div>
              <div className="controls">
                <button className="btn">
                  <svg className="icon" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg> Pause
                </button>
                <button className="btn">
                  <svg className="icon" viewBox="0 0 24 24">
                    <polygon points="5 4 15 12 5 20 5 4"/>
                    <rect x="17" y="4" width="2" height="16"/>
                  </svg> Skip
                </button>
              </div>
            </div>
            <div className="panel dim">
              <div className="step-title">Stretch</div>
              <div className="step-meta">
                <span className="small">Next</span>
                <span className="small">05:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom split: details and library */}
      <div className="bottom-split">
        <div className="card">
          <div className="card-h">
            <strong>Sequence details</strong>
            <span className="small">Reorder or move steps</span>
          </div>
          <div className="card-b">
            <div className="details-list">
              <div className="detail-row">
                <span>Water · 30s</span>
                <div>
                  <button className="btn">
                    <svg className="icon" viewBox="0 0 24 24">
                      <path d="M5 9l7-7 7 7M5 15l7 7 7-7M9 5l-7 7 7 7M15 5l7 7-7 7"/>
                    </svg>
                  </button>
                  <button className="btn">
                    <svg className="icon" viewBox="0 0 24 24">
                      <polygon points="5 4 15 12 5 20 5 4"/>
                      <rect x="17" y="4" width="2" height="16"/>
                    </svg> Move to later
                  </button>
                </div>
              </div>
              <div className="detail-row">
                <span>Meds · 90s</span>
                <div>
                  <button className="btn">
                    <svg className="icon" viewBox="0 0 24 24">
                      <path d="M5 9l7-7 7 7M5 15l7 7 7-7M9 5l-7 7 7 7M15 5l7 7-7 7"/>
                    </svg>
                  </button>
                  <button className="btn">
                    <svg className="icon" viewBox="0 0 24 24">
                      <polygon points="5 4 15 12 5 20 5 4"/>
                      <rect x="17" y="4" width="2" height="16"/>
                    </svg> Move to later
                  </button>
                </div>
              </div>
              <div className="detail-row">
                <span>Stretch · 300s</span>
                <div>
                  <button className="btn">
                    <svg className="icon" viewBox="0 0 24 24">
                      <path d="M5 9l7-7 7 7M5 15l7 7 7-7M9 5l-7 7 7 7M15 5l7 7-7 7"/>
                    </svg>
                  </button>
                  <button className="btn">
                    <svg className="icon" viewBox="0 0 24 24">
                      <polygon points="5 4 15 12 5 20 5 4"/>
                      <rect x="17" y="4" width="2" height="16"/>
                    </svg> Move to later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <strong>Library (Templates)</strong>
            <span className="small">Clone into My Sequences</span>
          </div>
          <div className="card-b">
            <div className="details-list">
              <div className="detail-row">
                <span>Morning Launch</span>
                <button className="btn">
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                  </svg> Use this
                </button>
              </div>
              <div className="detail-row">
                <span>Deep Work Warmup</span>
                <button className="btn">
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                  </svg> Use this
                </button>
              </div>
              <div className="detail-row">
                <span>Evening Reset</span>
                <button className="btn">
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                  </svg> Use this
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sequences;
