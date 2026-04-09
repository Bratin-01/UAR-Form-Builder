import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, logout } = useAuth();

  // Not logged in → back to login
  if (!user) return <Navigate to="/login" replace />;

  // Account disabled → force logout and back to login
  if (!user.is_enabled) {
    logout();
    return <Navigate to="/login" replace />;
  }

  // Role-restricted route → back to form if wrong role
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/uar-form" replace />;
  }

  return children;
}