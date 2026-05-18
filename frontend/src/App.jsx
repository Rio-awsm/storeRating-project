import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminStores } from "./pages/admin/AdminStores";
import { AdminCreateUser } from "./pages/admin/AdminCreateUser";
import { AdminCreateStore } from "./pages/admin/AdminCreateStore";
import { AdminUserDetail } from "./pages/admin/AdminUserDetail";
import { StoreList } from "./pages/user/StoreList";
import { OwnerDashboard } from "./pages/owner/OwnerDashboard";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "OWNER") return <Navigate to="/owner" replace />;
  return <Navigate to="/stores" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={["ADMIN"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/users/new" element={<ProtectedRoute roles={["ADMIN"]}><AdminCreateUser /></ProtectedRoute>} />
            <Route path="/admin/users/:id" element={<ProtectedRoute roles={["ADMIN"]}><AdminUserDetail /></ProtectedRoute>} />
            <Route path="/admin/stores" element={<ProtectedRoute roles={["ADMIN"]}><AdminStores /></ProtectedRoute>} />
            <Route path="/admin/stores/new" element={<ProtectedRoute roles={["ADMIN"]}><AdminCreateStore /></ProtectedRoute>} />
            <Route path="/stores" element={<ProtectedRoute roles={["USER"]}><StoreList /></ProtectedRoute>} />
            <Route path="/owner" element={<ProtectedRoute roles={["OWNER"]}><OwnerDashboard /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
