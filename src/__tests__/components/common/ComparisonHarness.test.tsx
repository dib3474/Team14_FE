import userEvent from '@testing-library/user-event';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../../scripts/design-comparison/templates/auth';
const Probe = () => {
  const auth = useAuth();
  return (
    <p role="status">
      {auth.isInitialized ? 'ready' : 'pending'} / {auth.isLoggedIn ? 'signed-in' : 'anonymous'} /{' '}
      {auth.userInfo?.username || 'guest'}
    </p>
  );
};
afterEach(() => window.history.replaceState(null, '', '/'));
test('protected comparison screens have a synchronous display-only signed-in fixture', () => {
  window.history.replaceState(null, '', '/settings');
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  expect(screen.getByRole('status')).toHaveTextContent('ready / signed-in / 축제 여행자');
});
test('the explicit login comparison remains synchronously anonymous', () => {
  window.history.replaceState(null, '', '/login');
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  expect(screen.getByRole('status')).toHaveTextContent('ready / anonymous / guest');
});

test('comparison login links open a ready protected fixture and returning to login stays anonymous', async () => {
  const user = userEvent.setup();
  window.history.replaceState(null, '', '/login');
  render(
    <AuthProvider>
      <BrowserRouter>
        <Link to="/settings">설정 미리보기</Link>
        <Link to="/login">로그인 미리보기</Link>
        <Routes>
          <Route path="/login" element={<Probe />} />
          <Route path="/settings" element={<Probe />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>,
  );
  expect(screen.getByRole('status')).toHaveTextContent('ready / anonymous / guest');
  await user.click(screen.getByRole('link', { name: '설정 미리보기' }));
  expect(window.location.pathname).toBe('/settings');
  expect(screen.getByRole('status')).toHaveTextContent('ready / signed-in / 축제 여행자');
  await user.click(screen.getByRole('link', { name: '로그인 미리보기' }));
  expect(screen.getByRole('status')).toHaveTextContent('ready / anonymous / guest');
});

test('comparison login screen can navigate to a protected sample without authenticating', async () => {
  const user = userEvent.setup();
  window.history.replaceState(null, '', '/login');
  render(
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <>
                <Probe />
                <Link to="/settings">설정 보기</Link>
              </>
            }
          />
          <Route path="/settings" element={<Probe />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>,
  );
  expect(screen.getByRole('status')).toHaveTextContent('ready / anonymous / guest');
  await user.click(screen.getByRole('link', { name: '설정 보기' }));
  expect(screen.getByRole('status')).toHaveTextContent('ready / signed-in / 축제 여행자');
});
