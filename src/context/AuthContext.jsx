import { createContext, useEffect, useState } from "react";
import { updateUserPassword as updateUserPasswordAPI, deleteUserAccount as deleteUserAccountAPI } from "../api/users";

export const AuthContext = createContext();

const API_BASE = "http://127.0.0.1:5000/api/users";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Add new functions
  const updateUserPassword = async (currentPassword, newPassword) => {
    if (!user?.userId) throw new Error("No user logged in");

    const res = await fetch(`${API_BASE}/${encodeURIComponent(user.userId)}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to update password");

    return data;
  };

  const deleteUserAccount = async () => {
    if (!user?.userId) throw new Error("No user logged in");

    await deleteUserAccount(user.userId);
    setUser(null); // logout after deletion
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      const nextUser = {
        email: data.email,
        role: data.role,
        userId: String(data.userId),
      };

      setUser(nextUser);
      return nextUser;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      const nextUser = {
        email: data.email || userData.email,
        role: data.role || userData.role,
        userId: String(data.userId),
      };

      setUser(nextUser);
      return nextUser;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateUserEmail = async (newEmail) => {
    if (!user?.email) throw new Error("No user logged in");

    try {
      const res = await fetch(
        `${API_BASE}/updateByEmail/${encodeURIComponent(user.email)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newEmail }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update email");
      }

      // update local state and localStorage
      const updatedUser = { ...user, email: data.email };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUserEmail, updateUserPassword, deleteUserAccount }}>
      {children}
    </AuthContext.Provider>
  );
}