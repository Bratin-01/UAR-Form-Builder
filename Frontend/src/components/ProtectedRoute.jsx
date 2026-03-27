import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps a route so only logged-in users (and optionally a specific role) can access it.
 * Props:
 *   children  – the page to render
 *   roles     – optional array of allowed roles, e.g. ["Admin"]
 */
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role))
    return <Navigate to="/uar-form" replace />;

  return children;
}