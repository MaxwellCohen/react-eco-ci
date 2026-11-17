'use client';
import * as React from 'react';
// Renders its server-rendered children only after a click, so they mount with no server HTML behind them.
export default function Modal({ children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <button id="open" onClick={() => setOpen(o => !o)}>{open ? 'close' : 'open'} terms</button>
      {open ? <div role="dialog">{children}</div> : null}
    </div>
  );
}
