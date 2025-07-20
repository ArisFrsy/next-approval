import { NextResponse } from "next/server";
import { getAllUserService } from "@/services/userService";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const perPage = parseInt(url.searchParams.get("perPage") || "10", 10);
  const search = url.searchParams.get("search") || "";
  const orderByField = url.searchParams.get("orderByField") || "id";
  const rawOrder = url.searchParams.get("orderByDirection") || "desc";
  const orderByDirection = rawOrder === "asc" ? "asc" : "desc"; // hanya "asc" atau "desc"

  try {
    const result = await getAllUserService({
      page,
      perPage,
      search,
      orderByField,
      orderByDirection,
    });

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
