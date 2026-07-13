"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, ChevronUp, ChevronDown, AlertTriangle } from "lucide-react";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

type StatusType = "draft" | "published" | "deprecated";

function StatusBadge({ status }: { status: StatusType }) {
  const cls = status === "published" ? "badge-published" : status === "draft" ? "badge-draft" : "badge-deprecated";
  const label = status === "published" ? "발행됨" : status === "draft" ? "초안" : "지원 종료";
  return <span className={`${cls} text-xs px-2 py-0.5 rounded-full font-medium`}>{label}</span>;
}

type DataTableProps<T extends Record<string, unknown>> = {
  title: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  newHref?: string;
  newLabel?: string;
};

export default function DataTable<T extends Record<string, unknown>>({
  title, description, data, columns, newHref, newLabel = "새 항목 만들기",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType | "all">("all");
  const [sortKey, setSortKey] = useState<string>("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    let rows = [...data];

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((v) =>
          typeof v === "string" && v.toLowerCase().includes(q)
        )
      );
    }

    if (statusFilter !== "all") {
      rows = rows.filter((r) => (r as Record<string, unknown>).status === statusFilter);
    }

    rows.sort((a, b) => {
      const va = String((a as Record<string, unknown>)[sortKey] ?? "");
      const vb = String((b as Record<string, unknown>)[sortKey] ?? "");
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

    return rows;
  }, [data, search, statusFilter, sortKey, sortDir]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
          {description && <p className="text-zinc-500 text-sm mt-1">{description}</p>}
        </div>
        {newHref && (
          <Link href={newHref} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> {newLabel}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="검색..."
            className="input-dark pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "draft", "published", "deprecated"] as const).map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                statusFilter === s
                  ? "bg-brand-50 border-brand-200 text-brand-600 font-semibold"
                  : "border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}>
              {s === "all" ? "전체" : s === "draft" ? "초안" : s === "published" ? "발행됨" : "지원 종료"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden bg-white/80">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200/60">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  {col.sortable !== false ? (
                    <button onClick={() => toggleSort(String(col.key))} className="flex items-center gap-1 hover:text-zinc-900 transition-colors">
                      {col.label}
                      {sortKey === String(col.key) ? (
                        sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : null}
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {paginated.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-12 text-zinc-400">항목이 없습니다.</td></tr>
            ) : paginated.map((row, i) => (
              <tr key={i} className="data-row">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-zinc-700">
                    {col.render
                      ? col.render(row)
                      : col.key === "status"
                      ? <StatusBadge status={String((row as Record<string, unknown>)[String(col.key)]) as StatusType} />
                      : String((row as Record<string, unknown>)[String(col.key)] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-zinc-500">{filtered.length}개 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}개 표시</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-40">이전</button>
            <span className="text-xs text-zinc-400 py-1.5 px-2">{page} / {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-40">다음</button>
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-500 mt-4 flex items-center gap-1.5">
        <AlertTriangle className="w-3 h-3" />
        Supabase 연결 후 실시간 데이터가 표시됩니다. 현재는 로컬 엔진 기반입니다.
      </p>
    </div>
  );
}
