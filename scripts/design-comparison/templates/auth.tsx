import { createElement, createContext, useContext, useState, type ReactNode } from 'react';
import fixture from '../fixture.json';
type PreviewUser = typeof fixture.user;
interface DisplayAuth {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  userInfo: PreviewUser | null;
  setUserInfo: (user: PreviewUser) => void;
  isLoggedIn: boolean;
  isInitialized: boolean;
  clearAuth: () => void;
}
// Loaded only by the generated comparison Vite alias, never the production entry.
const Context = createContext<DisplayAuth | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    window.location.pathname === '/login' ? null : 'local-design-preview-only',
  );
  const [userInfo, setUserInfo] = useState<PreviewUser | null>(() =>
    accessToken ? fixture.user : null,
  );
  const clearAuth = () => {
    setAccessToken(null);
    setUserInfo(null);
  };
  return createElement(
    Context.Provider,
    {
      value: {
        accessToken,
        setAccessToken,
        userInfo,
        setUserInfo,
        isLoggedIn: !!accessToken,
        isInitialized: true,
        clearAuth,
      },
    },
    children,
  );
};
export const useAuth = () => {
  const context = useContext(Context);
  if (!context) throw new Error('Comparison AuthProvider is missing');
  const anonymous = window.location.pathname === '/login';
  return {
    ...context,
    isInitialized: true,
    isLoggedIn: !anonymous,
    accessToken: anonymous ? null : context.accessToken || 'local-design-preview-only',
    userInfo: anonymous ? null : context.userInfo || fixture.user,
  };
};
