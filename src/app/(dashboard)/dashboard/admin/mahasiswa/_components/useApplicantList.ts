import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApplicantListResponse } from "./types";

export async function fetchApplicants(params: URLSearchParams) {
  const response = await fetch(`/api/admin/mahasiswa?${params.toString()}`);
  if (!response.ok) throw new Error("Gagal memuat data mahasiswa.");
  return (await response.json()) as ApplicantListResponse;
}

export function useApplicantList() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState("");
  const [statusRpl, setStatusRpl] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo(() => {
    const next = new URLSearchParams();
    next.set("page", String(page));
    next.set("limit", "10");
    if (q) next.set("q", q);
    if (period) next.set("period", period);
    if (statusRpl) next.set("statusRpl", statusRpl);
    return next;
  }, [page, period, q, statusRpl]);

  const query = useQuery({
    queryKey: ["admin-mahasiswa", params.toString()],
    queryFn: () => fetchApplicants(params)
  });

  function resetToFirstPage(callback: () => void) {
    callback();
    setPage(1);
  }

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

  return {
    q,
    setQ,
    period,
    setPeriod,
    statusRpl,
    setStatusRpl,
    page,
    setPage,
    resetToFirstPage,
    params,
    query,
    deactivateMutation
  };
}
