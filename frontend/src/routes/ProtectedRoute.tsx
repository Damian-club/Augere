import { Navigate } from "react-router-dom";
import { authService } from "../services";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const user = authService.getUser();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
