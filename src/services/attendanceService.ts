import prisma from "@/lib/prisma";
import { saveFileToLocal } from "./UploadService";
import { AttendanceRequest } from "@/model/requests/attendanceRequest";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export async function getAttendanceByUserId(userId: number) {
  try {
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        atd_userid: userId,
        atd_date_time: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
          lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
        },
      },
      orderBy: {
        atd_id: "asc",
      },
    });

    return {
      success: true,
      data: attendanceRecords,
    };
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return {
      success: false,
      message: "Failed to fetch attendance records",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function saveAttendance(attendanceData: AttendanceRequest) {
  try {
    if (attendanceData.file) {
      const file = attendanceData.file;
      const filePath = await saveFileToLocal(file);
      attendanceData.atd_photo_urls = filePath; // Save the file path in the request
    }

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const isoWIB = dayjs().tz("Asia/Jakarta").format(); // ISO 8601 +07:00

    const attendanceRecord = await prisma.attendance.create({
      data: {
        atd_userid: attendanceData.atd_userid,
        atd_username: attendanceData.atd_username,
        atd_date_time: isoWIB,
        atd_check_time: attendanceData.atd_check_time,
        atd_latitude: attendanceData.atd_latitude,
        atd_longitude: attendanceData.atd_longitude,
        atd_photo_urls: attendanceData.atd_photo_urls,
        atd_address: attendanceData.atd_address,
        created_at: new Date(),
        created_by: attendanceData.atd_userid?.toString() || "system",
        atd_tipe: attendanceData.atd_tipe || 0,
        atd_wfh: attendanceData.atd_wfh || 0,
      },
    });

    return {
      success: true,
      data: attendanceRecord,
    };
  } catch (error) {
    console.error("Error saving attendance record:", error);
    return {
      success: false,
      message: "Failed to save attendance record",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
