import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    if (email === "student@test.com" && password === "1234") {
      setUser({ role: "student", email });
      return true;
    }
    if (email === "admin@test.com" && password === "1234") {
      setUser({ role: "admin", email });
      return true;
    }
    return false;
  };

  const register = (data) => {
    setUser({ role: data.role, email: data.email });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}