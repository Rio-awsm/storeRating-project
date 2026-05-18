import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

export function AdminStores() {
  const [stores, setStores] = useState([]);
  const [err, setErr] = useState(null);
  const [filters, setFilters] = useState({ name: "", email: "", address: "" });
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.name) p.set("name", filters.name);
    if (filters.email) p.set("email", filters.email);
    if (filters.address) p.set("address", filters.address);
    p.set("sortBy", sortBy);
    p.set("order", order);
    return p.toString();
  }, [filters, sortBy, order]);

  useEffect(() => {
    api(`/admin/stores?${query}`).then((d) => setStores(d.stores)).catch((e) => setErr(e.message));
  }, [query]);

  function toggleSort(key) {
    if (sortBy === key) setOrder(order === "asc" ? "desc" : "asc");
    else { setSortBy(key); setOrder("asc"); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Stores</h1>
        <Link to="/admin/stores/new" className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg">+ New Store</Link>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FilterInput label="Name" value={filters.name} onChange={(v) => setFilters({ ...filters, name: v })} />
        <FilterInput label="Email" value={filters.email} onChange={(v) => setFilters({ ...filters, email: v })} />
        <FilterInput label="Address" value={filters.address} onChange={(v) => setFilters({ ...filters, address: v })} />
      </div>
      {err && <div className="text-rose-600 mb-4">{err}</div>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th onClick={() => toggleSort("name")} active={sortBy === "name"} order={order}>Name</Th>
              <Th onClick={() => toggleSort("email")} active={sortBy === "email"} order={order}>Email</Th>
              <Th onClick={() => toggleSort("address")} active={sortBy === "address"} order={order}>Address</Th>
              <th className="text-left px-4 py-2 font-medium">Owner</th>
              <th className="text-left px-4 py-2 font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-4 py-2 text-slate-900">{s.name}</td>
                <td className="px-4 py-2 text-slate-700">{s.email}</td>
                <td className="px-4 py-2 text-slate-700">{s.address}</td>
                <td className="px-4 py-2 text-slate-700">{s.owner ? s.owner.email : <span className="text-slate-400">—</span>}</td>
                <td className="px-4 py-2 text-slate-700">
                  {s.rating !== null ? (
                    <span><span className="font-semibold text-amber-600">{s.rating.toFixed(2)}</span><span className="text-xs text-slate-400"> ({s.ratingCount})</span></span>
                  ) : (
                    <span className="text-slate-400">No ratings yet</span>
                  )}
                </td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No stores match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, onClick, active, order }) {
  return (
    <th onClick={onClick} className="text-left px-4 py-2 font-medium cursor-pointer select-none hover:text-slate-900">
      {children}{active && <span className="ml-1 text-xs">{order === "asc" ? "▲" : "▼"}</span>}
    </th>
  );
}

function FilterInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Contains…" />
    </div>
  );
}
