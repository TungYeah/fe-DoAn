import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  // đang load /current
  if (loading) return null; // hoặc hiển thị spinner

  // nếu đã đăng nhập → đá sang dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
