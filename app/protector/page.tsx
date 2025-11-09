"use client";
import React, { useEffect } from "react";
import { useUser } from "../components/userContext";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Bloquear todo lo que NO sea admin o vendedor
    if (user && user.rol !== "admin" && user.rol !== "vendedor") {
      router.push("/no-access"); // página de acceso denegado
    }
  }, [user, isAuthenticated, router]);

  // Mientras cargan los datos o no tiene rol permitido, no mostrar nada
  if (!isAuthenticated || !user || (user.rol !== "admin" && user.rol !== "vendedor")) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
