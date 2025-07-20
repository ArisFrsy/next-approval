// types/user-response.ts

import { PengajuanResponse } from "./pengajuanResponse";

export interface UserResponse {
  id: number;
  name?: string;
  email?: string;
  username?: string;
  role_id?: number;
  warna: string;
  status?: string;
  toko_id: number;
  perusahaan_id: number;
  bpjs_perusahaan: number;
  bpjs_pegawai: number;
  gaji_real: number;
  gaji_pajak: number;
  created_at?: string;
  updated_at?: string;
  role_name?: string;
  target_poin?: number;

  // Relasi
  pengajuan_pegawai?: PengajuanResponse[];
  pengajuan_atasan?: PengajuanResponse[];
  pengajuan_approval?: UserApprovalResponse[];
  riwayat_status?: UserRiwayatStatusResponse[];
}

// Minimal version to prevent circular imports
export interface UserApprovalResponse {
  id: number;
  pengajuan_id: number;
  approver_id: number;
  role?: string;
  urutan?: number;
  status?: "Menunggu" | "Disetujui" | "Ditolak";
  catatan?: string;
  tanggal_approval?: string;
}

export interface UserRiwayatStatusResponse {
  id: number;
  pengajuan_id: number;
  status_sebelumnya?: string;
  status_baru?: string;
  waktu?: string;
  oleh_user_id?: number;
}
