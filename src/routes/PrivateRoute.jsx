import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // nếu chưa login → đá về trang /login
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
