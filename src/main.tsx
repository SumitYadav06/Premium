import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Boot success signal for the inline watchdog in index.html:
// the JS bundle has loaded and is executing, so dismiss the boot
// splash and reset the watchdog's retry counter. Without this, a
// stale cached page pointing at a dead bundle would hang forever
// on the native loading screen.
(window as any).__AJ_BOOTED = true;
try {
  sessionStorage.removeItem('aj_boot_tries');
  const boot = document.getElementById('aj-boot');
  if (boot) {
    boot.style.opacity = '0';
    window.setTimeout(() => boot.remove(), 400);
  }
} catch {
  // storage/DOM unavailable — the boot watchdog handles it instead
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
