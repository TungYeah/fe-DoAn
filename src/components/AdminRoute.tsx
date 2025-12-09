import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const role = localStorage.getItem("role");

  // Nếu không phải admin → đá về 403
  if (role !== "ADMIN") return <Navigate to="/403" replace />;

  return children;
}
