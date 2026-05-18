import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav("/login");
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold text-slate-900">
            Store Ratings
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {user?.role === "ADMIN" && (
              <>
                <Link to="/admin" className="text-slate-700 hover:text-indigo-600">Dashboard</Link>
                <Link to="/admin/users" className="text-slate-700 hover:text-indigo-600">Users</Link>
                <Link to="/admin/stores" className="text-slate-700 hover:text-indigo-600">Stores</Link>
              </>
            )}
            {user?.role === "USER" && (
              <Link to="/stores" className="text-slate-700 hover:text-indigo-600">Stores</Link>
            )}
            {user?.role === "OWNER" && (
              <Link to="/owner" className="text-slate-700 hover:text-indigo-600">My Store</Link>
            )}
            {user && (
              <>
                <Link to="/change-password" className="text-slate-700 hover:text-indigo-600">Change Password</Link>
                <span className="text-slate-500">{user.email}</span>
                <button onClick={handleLogout} className="text-rose-600 hover:text-rose-700">
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
