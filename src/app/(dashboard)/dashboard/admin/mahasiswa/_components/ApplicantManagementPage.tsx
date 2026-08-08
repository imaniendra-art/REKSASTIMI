"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApplicantForm } from "./ApplicantForm";
import { StatusBadge } from "./StatusBadge";
import type { ApplicantListResponse } from "./types";

async function fetchApplicants(params: URLSearchParams) {
  const response = await fetch(`/api/admin/mahasiswa?${params.toString()}`);
  if (!response.ok) throw new Error("Gagal memuat data mahasiswa.");
  return (await response.json()) as ApplicantListResponse;
}

export function ApplicantManagementPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState("");
  const [statusRpl, setStatusRpl] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const params = useMemo(() => {
    const next = new URLSearchParams();
    next.set("page", String(page));
    next.set("limit", "10");
    if (q) next.set("q", q);
    if (period) next.set("period", period);
    if (statusRpl) next.set("statusRpl", statusRpl);
    return next;
  }, [page, period, q, statusRpl]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-mahasiswa", params.toString()],
    queryFn: () => fetchApplicants(params)
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/mahasiswa", { method: "POST", body: formData });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Gagal menambah mahasiswa.");
      return body;
    },
    onSuccess: async () => {
      setShowCreate(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-mahasiswa"] });
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/mahasiswa/${id}/deactivate`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Gagal menonaktifkan mahasiswa.");
      return body;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-mahasiswa"] });
    }
  });

  function resetToFirstPage(callback: () => void) {
    callback();
    setPage(1);
  }

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#0d6efd]">Manajemen Mahasiswa</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Pusat data pendaftar, dokumen, nilai, dan progres RPL
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full bg-[#0d6efd] px-5 py-2 text-xs font-black uppercase text-white shadow-sm"
            onClick={() => setShowCreate(true)}
            type="button"
          >
            Tambah Mahasiswa
          </button>
          <a
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-black uppercase text-slate-700 shadow-sm"
            href={`/api/admin/mahasiswa?${params.toString()}&export=csv`}
            target="_blank"
          >
            Export / Download Daftar
          </a>
        </div>
      </div>

      <div className="mb-4 grid gap-3 rounded-2xl bg-white p-4 shadow-sm lg:grid-cols-[1fr_220px_220px]">
        <input
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none ring-[#0d6efd] focus:ring-2"
          onChange={(event) => resetToFirstPage(() => setQ(event.target.value))}
          placeholder="Cari nama/NIK/email/no pendaftar..."
          value={q}
        />
        <select
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none ring-[#0d6efd] focus:ring-2"
          onChange={(event) => resetToFirstPage(() => setPeriod(event.target.value))}
          value={period}
        >
          <option value="">Semua Periode</option>
          {data?.filters.periods.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none ring-[#0d6efd] focus:ring-2"
          onChange={(event) => resetToFirstPage(() => setStatusRpl(event.target.value))}
          value={statusRpl}
        >
          <option value="">Semua Status RPL</option>
          {data?.filters.statuses.map((item) => (
            <option key={item} value={item}>
              {item.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {showCreate ? (
        <div className="mb-5 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-black uppercase">Tambah Mahasiswa / Pendaftar</h2>
            <p className="mt-1 text-sm text-slate-500">Password awal akun mahasiswa baru: mahasiswa123</p>
          </div>
          <ApplicantForm
            mode="create"
            onCancel={() => setShowCreate(false)}
            onSubmit={async (formData) => {
              await createMutation.mutateAsync(formData);
            }}
            submitting={createMutation.isPending}
          />
          {createMutation.error ? <p className="mt-3 text-sm font-bold text-red-600">{createMutation.error.message}</p> : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-slate-50 text-[0.65rem] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-4">Nama</th>
                <th className="px-4 py-4">NIK / No. Pendaftar</th>
                <th className="px-4 py-4">Email / WhatsApp</th>
                <th className="px-4 py-4">Periode</th>
                <th className="px-4 py-4">Status RPL</th>
                <th className="px-4 py-4">Pembayaran</th>
                <th className="px-4 py-4">F02</th>
                <th className="px-4 py-4">F03</th>
                <th className="px-4 py-4">Asesmen</th>
                <th className="px-4 py-4">Hasil</th>
                <th className="px-4 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-10 text-center text-slate-500" colSpan={11}>Memuat data...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="px-4 py-10 text-center font-bold text-red-600" colSpan={11}>{error.message}</td>
                </tr>
              ) : data && data.data.length > 0 ? (
                data.data.map((item) => (
                  <tr className={`border-t border-slate-100 ${item.userStatus === "nonaktif" ? "bg-slate-50 opacity-60" : ""}`} key={item.id}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d6efd] font-black text-white">
                          {item.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{item.name || "-"}</p>
                          <p className="text-xs font-mono text-slate-500">@{item.username}</p>
                          {item.userStatus === "nonaktif" ? <p className="text-xs font-black text-red-600">NONAKTIF</p> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-mono text-xs font-bold">{item.identity?.nik || "-"}</p>
                      <p className="mt-1 font-mono text-xs text-[#0d6efd]">{item.registrationNumber || item.nim || "-"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold">{item.email || item.contact?.email || "-"}</p>
                      <p className="mt-1 text-xs font-bold text-emerald-700">{item.contact?.phone || "-"}</p>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold">{item.periodName || "-"}</td>
                    <td className="px-4 py-4"><StatusBadge value={item.statusRpl} /></td>
                    <td className="px-4 py-4"><StatusBadge value={item.progress.paymentStatus} /></td>
                    <td className="px-4 py-4"><StatusBadge value={item.progress.f02Status} /></td>
                    <td className="px-4 py-4"><StatusBadge value={item.progress.f03Status} /></td>
                    <td className="px-4 py-4"><StatusBadge value={item.progress.assessmentStatus} /></td>
                    <td className="px-4 py-4"><StatusBadge value={item.progress.resultStatus} /></td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Link className="rounded-full bg-[#0d6efd] px-3 py-1.5 text-xs font-black text-white" href={`/dashboard/admin/mahasiswa/${item.id}`}>
                          Lihat Detail
                        </Link>
                        <Link className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-700" href={`/dashboard/admin/mahasiswa/${item.id}?edit=1`}>
                          Edit
                        </Link>
                        <Link className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-700" href={`/dashboard/admin/mahasiswa/${item.id}#dokumen`}>
                          Download Berkas
                        </Link>
                        <Link className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-700" href={`/dashboard/admin/mahasiswa/${item.id}#asesmen`}>
                          Lihat Nilai
                        </Link>
                        <Link className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-700" href={`/dashboard/admin/mahasiswa/${item.id}#hasil`}>
                          Lihat Transkrip
                        </Link>
                        {item.userStatus !== "nonaktif" ? (
                          <button
                            className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-black text-red-600"
                            onClick={() => {
                              if (confirm(`Nonaktifkan ${item.name}?`)) deactivateMutation.mutate(item.id);
                            }}
                            type="button"
                          >
                            Nonaktifkan
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-12 text-center" colSpan={11}>
                    <p className="font-black text-slate-800">Belum Ada Mahasiswa</p>
                    <p className="mt-1 text-sm text-slate-500">Data akan muncul setelah pendaftar ditambahkan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
        <p className="text-sm font-bold text-slate-600">
          Total: {data?.meta.total ?? 0} data
        </p>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black disabled:opacity-40"
            disabled={!data || data.meta.page <= 1}
            onClick={() => setPage((value) => Math.max(value - 1, 1))}
            type="button"
          >
            Sebelumnya
          </button>
          <span className="text-xs font-black">
            {data?.meta.page ?? page} / {data?.meta.totalPages ?? 1}
          </span>
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black disabled:opacity-40"
            disabled={!data || data.meta.page >= data.meta.totalPages}
            onClick={() => setPage((value) => value + 1)}
            type="button"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </section>
  );
}
