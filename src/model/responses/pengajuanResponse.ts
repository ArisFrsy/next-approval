// types/pengajuan-response.ts

export interface PengajuanResponse {
  id: number;
  pegawai_id: number;
  kategori_id: number;
  nama_atasan_id?: number;
  tanggal_mulai?: string;
  jam_mulai?: string;
  tanggal_selesai?: string;
  jam_selesai?: string;
  alasan?: string;
  bukti_url?: string;
  status: string;
  created_at?: string;
  user?: UserResponse;
  kategori_perizinan?: KategoriPerizinanResponse;
  user_pengajuan_nama_atasan?: UserResponse | null;
  pengajuan_approval: PengajuanApprovalResponse[];
  riwayat_status: RiwayatStatusResponse[];
  user_pengajuan_pegawai_idTouser?: UserResponse;
}

export interface PengajuanApprovalResponse {
  id: number;
  pengajuan_id: number;
  approver_id: number;
  role?: string;
  urutan?: number;
  status?: "Menunggu" | "Disetujui" | "Ditolak";
  catatan?: string;
  tanggal_approval?: string;
  user?: UserResponse;
  pengajuan?: PengajuanResponse;
}

export interface RiwayatStatusResponse {
  id: number;
  pengajuan_id: number;
  status_sebelumnya?: string;
  status_baru?: string;
  waktu?: string;
  oleh_user_id?: number;
  user?: UserResponse | null;
}

export interface UserResponse {
  id: number;
  name?: string;
  email?: string;
  username?: string;
}

export interface KategoriPerizinanResponse {
  id: number;
  nama: string;
  keterangan?: string;
  icon_name?: string;
  icon_color?: string;
}
