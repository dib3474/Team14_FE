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
