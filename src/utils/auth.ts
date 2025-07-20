// utils/auth.ts
import { NextResponse } from "next/server";
import { verifyJwt } from "./jtw"; // pastikan ini verify JWT-mu
import { jwtDecode } from "jwt-decode";

export async function checkAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token || !verifyJwt(token)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = jwtDecode(token) as {
    userId: string;
    email: string;
    verified: boolean;
    expiresAt: string;
  };

  if (!data.verified) {
    return NextResponse.json(
      { message: "Email not verified" },
      { status: 401 }
    );
  }

  // check expiresAt
  const expiresAt = new Date(data.expiresAt);

  if (expiresAt < new Date()) {
    return NextResponse.json({ message: "Token expired" }, { status: 401 });
  }

  return null; // artinya valid dan lanjut
}
