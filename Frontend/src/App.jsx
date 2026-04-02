import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import LoginPage from "./pages/LoginPage";
import UARFormPage from "./pages/UARFormPage";
import UsersPage from "./pages/UsersPage";
import EditFormPage from "./pages/EditFormPage";
import FormRecordsPage from "./pages/FormRecordsPage";
import EditRecordsPage from "./pages/EditRecordsPage";
import UARPreviewPage from "./pages/UARPreviewPage";

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

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

          {/* Preview — no navbar/footer, protected but no AppLayout */}
          <Route path="/uar-preview" element={
            <ProtectedRoute>
              <UARPreviewPage />
            </ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}