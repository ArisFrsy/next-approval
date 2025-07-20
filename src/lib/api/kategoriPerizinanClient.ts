import { KategoriPerizinanResponse } from "@/model/responses/pengajuanResponse";
import { MetaResponse } from "@/model/responses/metaResponse";

export async function fetchKategoriPerizinan(): Promise<
  MetaResponse<KategoriPerizinanResponse[]>
> {
  const url = new URL(
    "next/api/protected/kategori-perizinan",
    window.location.origin
  );

  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized: Token not found");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch kategori perizinan");
  return res.json();
}
