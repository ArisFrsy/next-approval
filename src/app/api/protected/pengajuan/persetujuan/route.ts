import { NextResponse } from "next/server";
import {
  getAllPengajuanApprovalService,
  updateStatusApprovalService,
} from "@/services/pengajuanService";

export async function GET(request: Request) {
  try {
    // get from params
    const url = new URL(request.url);
    const params = url.searchParams;
    const approverId = params.get("approver_id")
      ? Number(params.get("approver_id"))
      : undefined;
    if (!approverId) {
      return NextResponse.json(
        { success: false, message: "Pegawai ID diperlukan" },
        { status: 400 }
      );
    }

    const pengajuanList = await getAllPengajuanApprovalService({
      approverId,
    });
    return NextResponse.json(pengajuanList, { status: 200 });
  } catch (error) {
    console.error("Error fetching pengajuan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pengajuan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pengajuan_id, status, approver_id, catatan } = body;

    if (!pengajuan_id || !status || !approver_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Pengajuan ID, status, dan approver ID diperlukan",
        },
        { status: 400 }
      );
    }

    const pengajuanId = Number(pengajuan_id);
    const approverId = Number(approver_id);
    if (isNaN(pengajuanId) || isNaN(approverId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Pengajuan ID dan approver ID harus berupa angka",
        },
        { status: 400 }
      );
    }

    if (status !== "Disetujui" && status !== "Ditolak") {
      return NextResponse.json(
        { success: false, message: "Status harus 'Disetujui' atau 'Ditolak'" },
        { status: 400 }
      );
    }
    const updatedPengajuan = await updateStatusApprovalService(
      pengajuanId,
      approverId,
      status,
      catatan
    );

    return NextResponse.json(updatedPengajuan, { status: 200 });
  } catch (error) {
    console.error("Error updating pengajuan status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update pengajuan status" },
      { status: 500 }
    );
  }
}
