"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { useToast } from "./ToastContext";

export type UserRole = "ADMINISTRATOR" | "TEACHER" | "STUDENT";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", {
        email,
        password,
      });

      const userData: User = data.user;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Đăng nhập thành công", `Chào mừng ${userData.name}!`);

      // Redirect based on role
      if (userData.role === "ADMINISTRATOR") {
        router.push("/dashboard/admin");
      } else if (userData.role === "TEACHER") {
        router.push("/dashboard/teacher");
      } else {
        router.push("/dashboard/student");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        "Đăng nhập thất bại",
        "Vui lòng kiểm tra lại email và mật khẩu"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const userName = user?.name;
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Đăng xuất thành công", `Hẹn gặp lại ${userName}!`);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
