import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from './i18n';

console.log('[NextJob] main.tsx executing...');

const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('[NextJob] Fatal: #root element not found!');
} else {
  try {
    ReactDOM.createRoot(rootEl).render(
      <AuthProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </AuthProvider>
    );
    console.log('[NextJob] ReactDOM.createRoot mounted successfully.');
  } catch (err) {
    console.error('[NextJob] Error mounting root:', err);
    const message = err instanceof Error ? err.stack || err.message : String(err);
    rootEl.textContent = '';
    const container = document.createElement('div');
    container.style.cssText = 'padding:20px;color:red;font-family:sans-serif;';
    const heading = document.createElement('h2');
    heading.textContent = 'Render Error';
    const pre = document.createElement('pre');
    pre.textContent = message;
    container.appendChild(heading);
    container.appendChild(pre);
    rootEl.appendChild(container);
  }
}
