import { NextResponse } from "next/server";
import {
  getAttendanceByUserId,
  saveAttendance,
} from "@/services/attendanceService";
import { AttendanceRequest } from "@/model/requests/attendanceRequest";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const userId = params.get("userId")
    ? Number(params.get("userId"))
    : undefined;

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "User ID is required" },
      { status: 400 }
    );
  }

  if (isNaN(userId)) {
    return NextResponse.json(
      { success: false, message: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    const result = await getAttendanceByUserId(userId);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId");
    const username = formData.get("username") as string;
    const clockInTime = formData.get("atd_check_time") as string;
    const clockInAddress = formData.get("atd_address") as string | null;
    const file = formData.get("fileRaw") as File | null;
    const atd_tipe = formData.get("atd_tipe")
      ? Number(formData.get("atd_tipe"))
      : 0;
    const atd_wfh = formData.get("atd_wfh")
      ? Number(formData.get("atd_wfh"))
      : 0;
    const latitude = formData.get("latitude") as string;
    const longitude = formData.get("longitude") as string;

    if (!userId || !clockInTime) {
      return NextResponse.json(
        { success: false, message: "User ID and clock-in time are required" },
        { status: 400 }
      );
    }

    const attendanceData: AttendanceRequest = {
      atd_userid: Number(userId),
      atd_username: username, // Replace with actual username if available
      atd_check_time: clockInTime,
      atd_latitude: latitude, // Replace with actual latitude if available
      atd_longitude: longitude, // Replace with actual longitude if available
      atd_address: clockInAddress ? String(clockInAddress) : "",
      atd_tipe: atd_tipe,
      atd_wfh: atd_wfh,
      file: file || null, // Handle file upload
    };

    const result = await saveAttendance(attendanceData);
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    }
    return NextResponse.json(
      { success: false, message: result.message },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save attendance" },
      { status: 500 }
    );
  }
}
