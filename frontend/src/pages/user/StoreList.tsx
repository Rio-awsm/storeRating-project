import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

interface StoreRow {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  ratingCount: number;
  myRating: number | null;
}

type SortKey = "name" | "address";

export function StoreList() {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    p.set("sortBy", sortBy);
    p.set("order", order);
    return p.toString();
  }, [search, sortBy, order]);

  async function reload() {
    try {
      const data = await api<{ stores: StoreRow[] }>(`/stores?${query}`);
      setStores(data.stores);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    reload();
  }, [query]);

  async function rate(storeId: string, value: number) {
    try {
      await api(`/stores/${storeId}/rating`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      });
      reload();
    } catch (e: any) {
      setErr(e.message);
    }
  }

  function toggleSort(key: SortKey) {
    if (sortBy === key) setOrder(order === "asc" ? "desc" : "asc");
    else {
      setSortBy(key);
      setOrder("asc");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Stores</h1>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs text-slate-500 mb-1">Search by name or address</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Type to filter…"
          />
        </div>
        <div className="flex gap-2 text-sm">
          <SortBtn active={sortBy === "name"} order={order} onClick={() => toggleSort("name")}>Name</SortBtn>
          <SortBtn active={sortBy === "address"} order={order} onClick={() => toggleSort("address")}>Address</SortBtn>
        </div>
      </div>
      {err && <div className="text-rose-600 mb-4">{err}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stores.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-lg font-semibold text-slate-900">{s.name}</div>
                <div className="text-sm text-slate-500">{s.address}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Overall</div>
                <div className="text-amber-600 font-semibold">
                  {s.rating !== null ? `${s.rating.toFixed(2)} ★` : "—"}
                </div>
                <div className="text-xs text-slate-400">{s.ratingCount} ratings</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Your rating</span>
                <span className="text-sm font-medium text-slate-900">
                  {s.myRating ? `${s.myRating} ★` : "Not rated"}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => rate(s.id, v)}
                    className={
                      "flex-1 py-1.5 rounded-md text-sm font-medium border transition " +
                      (s.myRating === v
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-400")
                    }
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {stores.length === 0 && (
          <div className="col-span-full text-center text-slate-400 py-12">
            No stores found.
          </div>
        )}
      </div>
    </div>
  );
}

function SortBtn({ children, active, order, onClick }: { children: React.ReactNode; active: boolean; order: "asc" | "desc"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-2 rounded-lg border " +
        (active ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-300 text-slate-700")
      }
    >
      Sort: {children}
      {active && <span className="ml-1 text-xs">{order === "asc" ? "▲" : "▼"}</span>}
    </button>
  );
}
