import { useState } from 'react';
import { AuthContext } from './AuthContextStore';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function buildUserFromToken(token) {
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload || payload.exp * 1000 <= Date.now()) {
    sessionStorage.clear();
    return null;
  }
  return {
    id: payload.sub,
    email: payload.email,
    roles: payload.roles || [],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    buildUserFromToken(sessionStorage.getItem('accessToken'))
  );
  const [loading] = useState(false);

  const loginUser = (accessToken, refreshToken) => {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    setUser(buildUserFromToken(accessToken));
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  const isAdmin = user?.roles?.some(r =>
    r === 'ROLE_ADMIN' || r === 'ADMIN'
  );

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
