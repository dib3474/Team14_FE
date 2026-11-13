import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserInfoResponse } from '@/types/UserType';
import { mockUser } from './hybridData';
type User = UserInfoResponse['content'];
interface MockAuth {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  userInfo: User;
  setUserInfo: (user: User) => void;
  isLoggedIn: boolean;
  isInitialized: boolean;
  clearAuth: () => void;
}
const Context = createContext<MockAuth | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>('dev-mock-session');
  const [userInfo, setUserInfo] = useState<User>(mockUser);
  const clearAuth = () => {
    setAccessToken('dev-mock-session');
    setUserInfo(mockUser);
  };
  return (
    <Context.Provider
      value={{
        accessToken,
        setAccessToken,
        userInfo,
        setUserInfo,
        isLoggedIn: true,
        isInitialized: true,
        clearAuth,
      }}
    >
      {children}
    </Context.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(Context);
  if (!context) throw new Error('Mock AuthProvider is missing');
  return context;
};
