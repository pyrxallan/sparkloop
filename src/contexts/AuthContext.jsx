import react from 'react';
import { AuthProvider } from '../contexts/AuthContext';

export const AuthContext = react.createContext();

export const AuthProviderComponent = ({ children }) => {
  const [user, setUser] = react.useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = react.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}