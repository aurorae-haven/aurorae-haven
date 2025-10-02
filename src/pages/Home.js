import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="card">
      <div className="card-h">
        <strong>Welcome</strong>
      </div>
      <div className="card-b">
        Open: <Link to="/schedule">Schedule</Link>, <Link to="/sequences">Sequences</Link>, <Link to="/braindump">Brain Dump</Link>. Export/Import is round‑trip compatible.
      </div>
    </div>
  );
}

export default Home;
