import { MetaResponse } from "@/model/responses/metaResponse";
import { AttendanceResponse } from "@/model/responses/attendanceResponse";
import { AttendanceRequest } from "@/model/requests/attendanceRequest";

export async function fetchAttendance(params?: {
  userId?: number;
}): Promise<MetaResponse<AttendanceResponse[]>> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized: Token not found");

  const url = new URL(`next/api/protected/attendance`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) url.searchParams.append(key, String(val));
    });
  }

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

export async function postAttendance(
  request: AttendanceRequest
): Promise<MetaResponse<AttendanceResponse>> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized: Token not found");

  const url = new URL(`next/api/protected/attendance`, window.location.origin);

  const formData = new FormData();
  formData.append("userId", String(request.atd_userid));
  formData.append("username", request.atd_username ?? "");
  formData.append("atd_check_time", request.atd_check_time ?? "");
  formData.append("atd_address", request.atd_address ?? "");
  if (request.file) {
    formData.append("fileRaw", request.file);
  }
  formData.append("atd_tipe", String(request.atd_tipe ?? 0));
  formData.append("atd_wfh", String(request.atd_wfh ?? 0));
  formData.append("latitude", String(request.atd_latitude ?? ""));
  formData.append("longitude", String(request.atd_longitude ?? ""));

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to post attendance");
  return res.json();
}
