import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/index.css';
import App from '@/App.tsx';

async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
    const { client } = await import('@/mocks/client');
    await client.start({
      onUnhandledRequest(request, print) {
        if (new URL(request.url).pathname.startsWith('/api/')) print.error();
      },
    });
    document.documentElement.dataset.mockMode = 'true';
    const { default: MockModeMenu } = await import('@/mocks/MockModeMenu');
    const tools = document.createElement('div');
    tools.id = 'mock-mode-tools';
    document.body.append(tools);
    createRoot(tools).render(<MockModeMenu />);
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
