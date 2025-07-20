// types/attendanceResponse.ts

export interface AttendanceResponse {
  atd_id: number;
  atd_userid?: number;
  atd_username?: string;
  atd_date_time?: string; // ISO string format
  atd_check_time?: string;
  atd_latitude?: string;
  atd_longitude?: string;
  atd_photo_urls?: string;
  created_at?: string; // ISO string format
  created_by?: string;
  updated_at?: string; // ISO string format
  updated_by?: string;
  atd_tipe?: number;
  atd_address?: string;
  atd_wfh?: number;
}
