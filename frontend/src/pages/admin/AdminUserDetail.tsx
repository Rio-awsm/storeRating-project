import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { Role } from "../../lib/api";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt: string;
  ownerRating: number | null;
  stores: { id: string; name: string }[];
}

export function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<{ user: UserDetail }>(`/admin/users/${id}`)
      .then((d) => setUser(d.user))
      .catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <div className="text-rose-600">{err}</div>;
  if (!user) return <div className="text-slate-500">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <Link to="/admin/users" className="text-sm text-indigo-600 hover:text-indigo-700">
        ← Back to users
      </Link>
      <h1 className="text-2xl font-semibold text-slate-900 mt-2 mb-6">{user.name}</h1>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <Row label="Email" value={user.email} />
        <Row label="Address" value={user.address} />
        <Row label="Role" value={user.role} />
        {user.role === "OWNER" && (
          <>
            <Row
              label="Average rating across owned stores"
              value={user.ownerRating !== null ? user.ownerRating.toFixed(2) : "No ratings yet"}
            />
            <Row
              label="Owned stores"
              value={user.stores.length > 0 ? user.stores.map((s) => s.name).join(", ") : "None"}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="col-span-2 text-slate-900">{value}</div>
    </div>
  );
}
