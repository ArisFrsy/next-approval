import { PengajuanResponse } from "./pengajuanResponse";

export interface KategoriPerizinanResponse {
  id: number;
  nama: string;
  keterangan?: string;
  icon_name?: string;
  icon_color?: string;
  // Opsional: jika ingin menyertakan relasi pengajuan
  pengajuan?: PengajuanResponse[]; // pastikan kamu sudah buat model ini
}
