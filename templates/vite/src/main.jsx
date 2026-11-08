import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as React from 'react';
import FormCounter from './FormCounter.jsx';

function App() {
  const [n, setN] = useState(0);
  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>Vite + React</h1>
      <p>React <code>{React.version}</code></p>
      <button onClick={() => setN(n + 1)}>count {n}</button>
      <p><a href="/form-counter">/form-counter (useActionState + form actions)</a></p>
      <p><a href="/version.json">/version.json</a></p>
    </main>
  );
}
function FormCounterPage() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>Form action counter</h1>
      <p>React <code>{React.version}</code> &middot; <a href="/">home</a></p>
      <FormCounter />
    </main>
  );
}
const Page = location.pathname.replace(/\/$/, '') === '/form-counter' ? FormCounterPage : App;
createRoot(document.getElementById('root')).render(<StrictMode><Page /></StrictMode>);
