import prisma from "@/lib/prisma";

export async function getKategoriPerizinan() {
  try {
    const categories = await prisma.kategori_perizinan.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error("Error fetching Pengajuan:", error);
    return {
      success: false,
      message: "Failed to fetch Pengajuan",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
