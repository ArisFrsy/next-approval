import { NextResponse } from "next/server";
import {
  savePengajuanService,
  getAllPengajuanService,
} from "@/services/pengajuanService";
import { CreatePengajuanRequest } from "@/model/requests/pengajuanRequest";

export async function POST(request: Request) {
  try {
    // parser from form data
    const formData = await request.formData();
    const body: CreatePengajuanRequest = {
      pegawai_id: formData.get("pegawai_id")
        ? Number(formData.get("pegawai_id"))
        : 0,
      kategori_id: formData.get("kategori_id")
        ? Number(formData.get("kategori_id"))
        : 0,
      nama_atasan_id: formData.get("nama_atasan_id")
        ? Number(formData.get("nama_atasan_id"))
        : 0,
      tanggal_mulai: formData.get("tanggal_mulai")
        ? String(formData.get("tanggal_mulai"))
        : "",
      jam_mulai: formData.get("jam_mulai")
        ? String(formData.get("jam_mulai"))
        : "",
      tanggal_selesai: formData.get("tanggal_selesai")
        ? String(formData.get("tanggal_selesai"))
        : "",
      jam_selesai: formData.get("jam_selesai")
        ? String(formData.get("jam_selesai"))
        : "",
      alasan: formData.get("alasan") ? String(formData.get("alasan")) : "",
      bukti_file: formData.get("bukti_file") as File | null,
      list_approval: formData.get("list_approval")
        ? JSON.parse(String(formData.get("list_approval")))
        : [],
    };

    // validasi input
    if (!body.pegawai_id || !body.kategori_id) {
      return NextResponse.json(
        { success: false, message: "Pegawai ID dan Kategori ID diperlukan" },
        { status: 400 }
      );
    }

    if (!body.tanggal_mulai || !body.jam_mulai) {
      return NextResponse.json(
        { success: false, message: "Tanggal dan Jam Mulai diperlukan" },
        { status: 400 }
      );
    }

    const result = await savePengajuanService(body);

    if (result && result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error saving pengajuan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save pengajuan" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // get from params
    const url = new URL(request.url);
    const params = url.searchParams;
    const pegawaiId = params.get("pegawai_id")
      ? Number(params.get("pegawai_id"))
      : undefined;
    const kategoriId = params.get("kategori_id")
      ? Number(params.get("kategori_id"))
      : undefined;
    const status = params.get("status")
      ? String(params.get("status"))
      : undefined;
    const tanggalMulaiStr = params.get("tanggal_mulai");
    const tanggalMulai = tanggalMulaiStr
      ? new Date(tanggalMulaiStr)
      : undefined;
    const tanggalSelesaiStr = params.get("tanggal_selesai");
    const tanggalSelesai = tanggalSelesaiStr
      ? new Date(tanggalSelesaiStr)
      : undefined;
    const page = params.get("page") ? Number(params.get("page")) : 1;
    const perPage = params.get("perPage") ? Number(params.get("perPage")) : 10;

    if (!pegawaiId) {
      return NextResponse.json(
        { success: false, message: "Pegawai ID diperlukan" },
        { status: 400 }
      );
    }

    const pengajuanList = await getAllPengajuanService({
      page,
      perPage,
      status,
      pegawaiId,
      tanggalMulai,
      tanggalSelesai,
      kategoriId,
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
