import { UserResponse } from "@/model/responses/userResponse";
import { MetaResponse } from "@/model/responses/metaResponse";

export async function fetchUsers(params?: {
  page?: number;
  perPage?: number;
  search?: string;
  orderByField?: string;
  orderByDirection?: "asc" | "desc";
}): Promise<MetaResponse<UserResponse[]>> {
  const url = new URL("next/api/protected/users", window.location.origin); // fixed: /api/users (remove "next/")

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) url.searchParams.append(key, String(val));
    });
  }

  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized: Token not found");

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
