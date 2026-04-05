import { createContext, useEffect, useState } from "react";

import {
  updateUserPassword as updateUserPasswordAPI,
  deleteUserAccount as deleteUserAccountAPI
} from "../api/users";

export const AuthContext = createContext();

const API_BASE = "http://127.0.0.1:5000/api/users";

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Keep localStorage synced
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);



  // PASSWORD UPDATE
  const updateUserPassword = async (
    currentPassword,
    newPassword
  ) => {

    if (!user?.userId)
      throw new Error("No user logged in");

    try {

      // Use API helper
      const data =
        await updateUserPasswordAPI(
          user.userId,
          currentPassword,
          newPassword
        );

      return data;

    } catch (err) {

      console.error(err);
      throw err;

    }

  };



  // DELETE ACCOUNT  ✅ FIXED
  const deleteUserAccount = async () => {

    if (!user?.userId)
      throw new Error("No user logged in");

    try {

      // FIX: call API function, not itself
      await deleteUserAccountAPI(user.userId);

      // logout after deletion
      setUser(null);

    } catch (err) {

      console.error(err);
      throw err;

    }

  };



  // LOGIN
  const login = async (email, password) => {

    try {

      const res =
        await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Login failed"
        );
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



  // REGISTER
  const register = async (userData) => {

    try {

      const res =
        await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(userData)
        });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Registration failed"
        );
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



  // UPDATE EMAIL
  const updateUserEmail = async (newEmail) => {

    if (!user?.email)
      throw new Error("No user logged in");

    try {

      const res =
        await fetch(
          `${API_BASE}/updateByEmail/${encodeURIComponent(user.email)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: newEmail
            })
          }
        );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to update email"
        );
      }

      // Update state only (localStorage handled by useEffect)
      const updatedUser = {
        ...user,
        email: data.email
      };

      setUser(updatedUser);

      return updatedUser;

    } catch (err) {

      console.error(err);
      throw err;

    }

  };



  // LOGOUT
  const logout = () => {

    setUser(null);

  };



  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUserEmail,
        updateUserPassword,
        deleteUserAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}