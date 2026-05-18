import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

const roleBadge = {
  ADMIN: "bg-rose-50 text-rose-700 border-rose-200",
  USER: "bg-slate-50 text-slate-700 border-slate-200",
  OWNER: "bg-amber-50 text-amber-700 border-amber-200",
};

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState(null);
  const [filters, setFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.name) p.set("name", filters.name);
    if (filters.email) p.set("email", filters.email);
    if (filters.address) p.set("address", filters.address);
    if (filters.role) p.set("role", filters.role);
    p.set("sortBy", sortBy);
    p.set("order", order);
    return p.toString();
  }, [filters, sortBy, order]);

  useEffect(() => {
    api(`/admin/users?${query}`).then((d) => setUsers(d.users)).catch((e) => setErr(e.message));
  }, [query]);

  function toggleSort(key) {
    if (sortBy === key) setOrder(order === "asc" ? "desc" : "asc");
    else { setSortBy(key); setOrder("asc"); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <Link to="/admin/users/new" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ New User</Link>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <FilterInput label="Name" value={filters.name} onChange={(v) => setFilters({ ...filters, name: v })} />
        <FilterInput label="Email" value={filters.email} onChange={(v) => setFilters({ ...filters, email: v })} />
        <FilterInput label="Address" value={filters.address} onChange={(v) => setFilters({ ...filters, address: v })} />
        <div>
          <label className="block text-xs text-slate-500 mb-1">Role</label>
          <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
            <option value="OWNER">Store Owner</option>
          </select>
        </div>
      </div>
      {err && <div className="text-rose-600 mb-4">{err}</div>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th onClick={() => toggleSort("name")} active={sortBy === "name"} order={order}>Name</Th>
              <Th onClick={() => toggleSort("email")} active={sortBy === "email"} order={order}>Email</Th>
              <Th onClick={() => toggleSort("address")} active={sortBy === "address"} order={order}>Address</Th>
              <Th onClick={() => toggleSort("role")} active={sortBy === "role"} order={order}>Role</Th>
              <th className="text-left px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-2 text-slate-900">{u.name}</td>
                <td className="px-4 py-2 text-slate-700">{u.email}</td>
                <td className="px-4 py-2 text-slate-700">{u.address}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${roleBadge[u.role]}`}>{u.role}</span>
                </td>
                <td className="px-4 py-2">
                  <Link to={`/admin/users/${u.id}`} className="text-indigo-600 hover:text-indigo-700 text-sm">View</Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No users match these filters.</td></tr>
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
