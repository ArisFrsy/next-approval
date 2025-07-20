// lib/api/pengajuanUser.ts
import { MetaResponse } from "@/model/responses/metaResponse";
import { CreatePengajuanRequest } from "@/model/requests/pengajuanRequest";
import {
  PengajuanApprovalResponse,
  PengajuanResponse,
} from "@/model/responses/pengajuanResponse";

export async function postPengajuan(
  request: CreatePengajuanRequest
): Promise<MetaResponse<PengajuanResponse>> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized: Token not found");

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  const formData = new FormData();
  formData.append("pegawai_id", request.pegawai_id.toString());
  formData.append("kategori_id", request.kategori_id.toString());
  if (request.nama_atasan_id !== undefined && request.nama_atasan_id !== null) {
    formData.append("nama_atasan_id", request.nama_atasan_id.toString());
  }
  formData.append(
    "tanggal_mulai",
    request.tanggal_mulai ? request.tanggal_mulai : ""
  );
  formData.append("jam_mulai", request.jam_mulai ? request.jam_mulai : "");
  formData.append(
    "tanggal_selesai",
    request.tanggal_selesai ? request.tanggal_selesai : ""
  );
  formData.append(
    "jam_selesai",
    request.jam_selesai ? request.jam_selesai : ""
  );
  if (request.alasan) formData.append("alasan", request.alasan);
  if (request.bukti_file_raw && request.bukti_file_raw.length > 0) {
    formData.append("bukti_file", request.bukti_file_raw[0]);
  }

  formData.append("list_approval", JSON.stringify(request.list_approval));
  const body = formData;
  // NOTE: jangan set "Content-Type" saat pakai FormData, browser akan set otomatis

  const url = new URL("next/api/protected/pengajuan", window.location.origin); // fixed: /api/users (remove "next/")

  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  const result: MetaResponse<PengajuanResponse> = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result.message || "Gagal mengirim pengajuan");
  }

  return result;
}

export async function fetchPengajuan(params?: {
  page?: number;
  perPage?: number;
  pegawai_id?: number;
  status?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  kategori_id?: number;
}): Promise<MetaResponse<PengajuanResponse[]>> {
  const url = new URL("next/api/protected/pengajuan", window.location.origin); // fixed: /api/users (remove "next/")

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) url.searchParams.append(key, String(val));
    });
  }

  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized: Token not found");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchPersetujuan(params?: {
  approver_id?: number;
}): Promise<MetaResponse<PengajuanApprovalResponse[]>> {
  const url = new URL(
    "next/api/protected/pengajuan/persetujuan",
    window.location.origin
  ); // fixed: /api/users (remove "next/")

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) url.searchParams.append(key, String(val));
    });
  }

  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized: Token not found");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function postPengajuanPersetujuan(request?: {
  pengajuan_id: number;
  status: "Disetujui" | "Ditolak";
  approver_id: number;
  catatan?: string;
}): Promise<MetaResponse<PengajuanResponse>> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized: Token not found");

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };
  const body = JSON.stringify(request);
  headers["Content-Type"] = "application/json";

  const url = new URL(
    "next/api/protected/pengajuan/persetujuan",
    window.location.origin
  );

  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  const result: MetaResponse<PengajuanResponse> = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result.message || "Gagal mengirim pengajuan");
  }

  return result;
}
