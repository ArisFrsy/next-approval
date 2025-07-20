import { NextResponse } from "next/server";
import { getKategoriPerizinan } from "@/services/kategoriPerizinanService";

export async function GET() {
  try {
    const result = await getKategoriPerizinan();

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching Kategori Perizinan:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
