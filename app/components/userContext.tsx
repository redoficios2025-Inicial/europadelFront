"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

// Tipado del usuario
export interface User {
  nombre: string;
  id:string;
  rol: "admin" | "vendedor" | "usuario";
}

interface UserContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loginUser: (userData: User, tokenData: string) => void;
  logoutUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe usarse dentro de UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        try {
          return JSON.parse(storedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      return storedToken && storedToken !== "undefined" ? storedToken : null;
    }
    return null;
  });

  const loginUser = (userData: User, tokenData: string) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
    // Redireccionar y recargar página para limpiar estados
    router.push("/");
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
