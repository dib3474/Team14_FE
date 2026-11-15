import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { vi } from 'vitest';

vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080');

// IntersectionObserver Mock
global.IntersectionObserver = class IntersectionObserver {
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {}

  observe() {
    return null;
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  get root() {
    return null;
  }

  get rootMargin() {
    return '';
  }

  get thresholds() {
    return [];
  }
} as unknown as typeof IntersectionObserver;

beforeAll(() => server.listen());
// Auth initialization is anonymous by default; keep tests off the real network.
beforeEach(() =>
  server.use(
    http.post('*/api/jwt/exchange', () => HttpResponse.json({}, { status: 401 })),
    http.get('*/api/festivals/:festivalId/notices', () =>
      HttpResponse.json({ content: [], last: true, totalElements: 0, totalPages: 0 }),
    ),
  ),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
