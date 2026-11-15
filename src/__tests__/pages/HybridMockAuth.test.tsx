import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/mocks/MockAuthContext';
const Probe = () => {
  const auth = useAuth();
  return (
    <p role="status">
      {String(auth.isInitialized)} / {String(auth.isLoggedIn)} / {auth.userInfo?.userId}
    </p>
  );
};
test('mock screens start initialized with the sample account without login', () => {
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  expect(screen.getByRole('status')).toHaveTextContent('true / true / 7');
});
