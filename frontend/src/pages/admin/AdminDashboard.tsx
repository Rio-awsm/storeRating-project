import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

interface Stats {
  userCount: number;
  storeCount: number;
  ratingCount: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<Stats>("/admin/dashboard")
      .then(setStats)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link
            to="/admin/users/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            + New User
          </Link>
          <Link
            to="/admin/stores/new"
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            + New Store
          </Link>
        </div>
      </div>
      {err && <div className="text-rose-600 mb-4">{err}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total users" value={stats?.userCount} />
        <StatCard label="Total stores" value={stats?.storeCount} />
        <StatCard label="Total ratings" value={stats?.ratingCount} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-3xl font-semibold text-slate-900 mt-2">
        {value ?? "…"}
      </div>
    </div>
  );
}
