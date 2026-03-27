import { createContext, useContext, useState } from "react";
import USERS from "../assets/users.json";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("uar_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userId, password) => {
    const found = USERS.find(
      (u) => u.userId === userId && u.password === password
    );
    if (found) {
      const { password: _, ...safe } = found;
      setUser(safe);
      sessionStorage.setItem("uar_user", JSON.stringify(safe));
      return { success: true, user: safe };
    }
    return { success: false, error: "Invalid User ID or Password." };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("uar_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);