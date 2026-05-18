import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export function OwnerDashboard() {
  const [stores, setStores] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api("/owner/dashboard").then((d) => setStores(d.stores)).catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="text-rose-600">{err}</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Your stores</h1>
      {stores.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          You don't own any stores yet. Ask an admin to assign you one.
        </div>
      )}
      <div className="space-y-6">
        {stores.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">{s.name}</div>
                <div className="text-sm text-slate-500">{s.address}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Average rating</div>
                <div className="text-2xl font-semibold text-amber-600">{s.averageRating !== null ? `${s.averageRating.toFixed(2)} ★` : "—"}</div>
                <div className="text-xs text-slate-400">{s.ratingCount} ratings</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">Raters</div>
              {s.raters.length === 0 ? (
                <div className="text-sm text-slate-400">No ratings submitted yet.</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="text-left py-1 font-normal">Name</th>
                      <th className="text-left py-1 font-normal">Email</th>
                      <th className="text-left py-1 font-normal">Rating</th>
                      <th className="text-left py-1 font-normal">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.raters.map((r) => (
                      <tr key={r.userId} className="border-t border-slate-100">
                        <td className="py-1 text-slate-900">{r.name}</td>
                        <td className="py-1 text-slate-700">{r.email}</td>
                        <td className="py-1 text-amber-600 font-medium">{r.value} ★</td>
                        <td className="py-1 text-slate-500">{new Date(r.ratedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
