import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FestivalsAreaSection from '@/pages/Festivals/components/FestivalsAreaSection';
import fixture from '../../../scripts/design-comparison/fixture.json';
test('previous browse region navigation retains the selected date and current conditions', () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(['festivals', '1', false], {
    pages: [{ data: { content: [fixture.festivals[0]], last: true, totalElements: 1 } }],
    pageParams: [0],
  });
  render(
    <MemoryRouter
      initialEntries={[
        '/festivals/1?current=false&startDate=2026-11-01&endDate=2026-12-31&source=home',
      ]}
    >
      <QueryClientProvider client={client}>
        <Routes>
          <Route path="/festivals/:areaId" element={<FestivalsAreaSection />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  );
  const nav = within(screen.getByRole('navigation', { name: '축제 지역' }));
  expect(nav.getByRole('link', { name: '서울' })).toHaveAttribute('aria-current', 'page');
  const url = new URL(
    nav.getByRole('link', { name: '인천' }).getAttribute('href')!,
    'http://localhost',
  );
  expect(url.pathname).toBe('/festivals/2');
  for (const [key, value] of [
    ['current', 'false'],
    ['startDate', '2026-11-01'],
    ['endDate', '2026-12-31'],
    ['source', 'home'],
  ])
    expect(url.searchParams.get(key)).toBe(value);
});
