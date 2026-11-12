import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '/src/styles/index.css';
import App from '/src/App';
document.documentElement.dataset.comparison = 'true';
if (new URLSearchParams(location.search).get('text') === '200')
  document.documentElement.style.fontSize = '200%';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
