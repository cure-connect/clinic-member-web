import { useState, useEffect } from "react";
import type { User } from "../types/index.tsx";

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("clinicUser");
    const savedToken = localStorage.getItem("clinicToken");

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        localStorage.removeItem("clinicUser");
        localStorage.removeItem("clinicToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await fetch("http://localhost:8888/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.data.token);

      localStorage.setItem("clinicUser", JSON.stringify(data.user));
      localStorage.setItem("clinicToken", data.data.token);
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("clinicUser");
    localStorage.removeItem("clinicToken");
  };

  return { user, token, login, logout, isLoading };
};
