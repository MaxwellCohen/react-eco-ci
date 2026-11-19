'use client';
import * as React from 'react';
// Shows one tab at a time and unmounts the others. `children` are the server panels, one per label;
// the last tab is a Client Component panel.
export default function Tabs({ labels, children }) {
  const [tab, setTab] = React.useState(0);
  return (
    <div>
      <nav>
        {labels.map((label, i) => (
          <button key={label} id={'tab-' + i} onClick={() => setTab(i)}>{label}</button>
        ))}
        <button id={'tab-' + labels.length} onClick={() => setTab(labels.length)}>Notes</button>
      </nav>
      {tab < labels.length ? children[tab] : <p id="notes">Notes is a Client Component panel.</p>}
    </div>
  );
}
