import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import LoginPage from "./pages/LoginPage";
import UARFormPage from "./pages/UARFormPage";
import UsersPage from "./pages/UsersPage";
import EditFormPage from "./pages/EditFormPage";
import FormRecordsPage from "./pages/FormRecordsPage";
import EditRecordsPage from "./pages/EditRecordsPage";

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root → login directly, no redirect chain */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* User + Admin */}
          <Route path="/uar-form" element={
            <ProtectedRoute>
              <AppLayout><UARFormPage /></AppLayout>
            </ProtectedRoute>
          }/>
          <Route path="/form-records" element={
            <ProtectedRoute>
              <AppLayout><FormRecordsPage /></AppLayout>
            </ProtectedRoute>
          }/>

          {/* Admin only */}
          <Route path="/users" element={
            <ProtectedRoute roles={["Admin"]}>
              <AppLayout><UsersPage /></AppLayout>
            </ProtectedRoute>
          }/>
          <Route path="/edit-form" element={
            <ProtectedRoute roles={["Admin"]}>
              <AppLayout><EditFormPage /></AppLayout>
            </ProtectedRoute>
          }/>
          <Route path="/edit-records" element={
            <ProtectedRoute roles={["Admin"]}>
              <AppLayout><EditRecordsPage /></AppLayout>
            </ProtectedRoute>
          }/>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}