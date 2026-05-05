import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({
          id: payload.sub,
          email: payload.email,
          roles: payload.roles || [],
        });
      } else {
        sessionStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (accessToken, refreshToken) => {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    const payload = parseJwt(accessToken);
    setUser({
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
    });
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

export const useAuth = () => useContext(AuthContext);
