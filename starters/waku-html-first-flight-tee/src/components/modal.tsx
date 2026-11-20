'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

// Renders its children only after the first click, so on a first load the
// children never reach the HTML and cannot be adopted from it.
export function Modal({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button id="open" onClick={() => setOpen(true)}>
        open
      </button>
      {open && <div id="modal">{children}</div>}
    </div>
  );
}
