// types/pengajuan-approval-request.ts

export interface CreateApprovalRequest {
  pengajuan_id?: number;
  approver_id: number;
  role?: string;
  urutan?: number;
  catatan?: string;
}

export interface UpdateApprovalStatusRequest {
  id: number;
  status: "Menunggu" | "Disetujui" | "Ditolak";
  catatan?: string;
}
