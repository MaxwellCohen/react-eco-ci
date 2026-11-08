import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as React from 'react';

function App() {
  const [n, setN] = useState(0);
  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>Vite + React</h1>
      <p>React <code>{React.version}</code></p>
      <button onClick={() => setN(n + 1)}>count {n}</button>
      <p><a href="/version.json">/version.json</a></p>
    </main>
  );
}
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
