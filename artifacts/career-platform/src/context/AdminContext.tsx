import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetAdminSession, useAdminLogout } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AdminContextType {
  isAuthenticated: boolean;
  username: string | null;
  isLoading: boolean;
  logout: () => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("admin_token"));
  const [, setLocation] = useLocation();

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("admin_token", newToken);
    } else {
      localStorage.removeItem("admin_token");
    }
    setTokenState(newToken);
  };

  const { data: session, isLoading } = useGetAdminSession({
    query: {
      enabled: !!token,
      retry: false,
    },
    request: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const logoutMutation = useAdminLogout({
    request: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const logout = () => {
    logoutMutation.mutate({}, {
      onSettled: () => {
        setToken(null);
        setLocation("/admin");
      }
    });
  };

  const isAuthenticated = !!token && session?.authenticated === true;

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        username: session?.username ?? null,
        isLoading,
        logout,
        token,
        setToken,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
