import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootEl = document.getElementById('root')!;

try {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (err) {
  rootEl.innerHTML = `<div style="background:#0a0a1a;color:#f87171;padding:24px;font-family:monospace;min-height:100vh">
    <h2>Startup Error</h2>
    <pre>${err instanceof Error ? err.stack : JSON.stringify(err, null, 2)}</pre>
  </div>`;
}
