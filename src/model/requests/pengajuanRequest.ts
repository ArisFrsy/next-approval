import { CreateApprovalRequest } from "./pengajuanApprovalRequest";

export interface CreatePengajuanRequest {
  pegawai_id: number;
  kategori_id: number;
  nama_atasan_id?: number;
  tanggal_mulai?: string; // format: YYYY-MM-DD
  jam_mulai?: string; // format: HH:mm:ss
  tanggal_selesai?: string;
  jam_selesai?: string;
  alasan?: string;
  bukti_url?: string;
  bukti_file: File | null; // Untuk upload file bukti
  bukti_file_raw?: FileList | null; // Untuk upload file bukti (raw)
  list_approval?: CreateApprovalRequest[];
}

export interface UpdatePengajuanRequest
  extends Partial<CreatePengajuanRequest> {
  status?: string;
}
