'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

// Shows one tab at a time and unmounts the others. `children` are the server
// panels, one per label; the last tab is a Client Component panel.
export function Tabs({ labels, children }: { labels: string[]; children: ReactNode[] }) {
  const [tab, setTab] = useState(0);
  return (
    <div>
      <nav>
        {labels.map((label, i) => (
          <button key={label} id={'tab-' + i} onClick={() => setTab(i)}>
            {label}
          </button>
        ))}
        <button id={'tab-' + labels.length} onClick={() => setTab(labels.length)}>
          Notes
        </button>
      </nav>
      {tab < labels.length ? children[tab] : <p id="notes">Notes is a Client Component panel.</p>}
    </div>
  );
}
