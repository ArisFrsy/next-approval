// types/attendanceRequest.ts

export interface AttendanceRequest {
  atd_userid?: number;
  atd_username?: string;
  atd_date_time?: string; // ISO string format (e.g., "2025-07-18T10:00:00Z")
  atd_check_time?: string;
  atd_latitude?: string;
  atd_longitude?: string;
  atd_photo_urls?: string;
  atd_tipe?: number;
  atd_address?: string;
  atd_wfh?: number;
  created_by?: string;
  updated_by?: string;
  fileRaw?: FileList | null | undefined; // For file uploads
  file?: File | null; // For file uploads
}
