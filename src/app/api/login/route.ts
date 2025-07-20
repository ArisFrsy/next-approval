import { NextResponse } from "next/server";
import { loginService } from "@/services/authService";
import { LoginRequest } from "@/model/requests/LoginRequest";

export async function POST(request: Request) {
  const body = await request.json();
  const username: string = body.username;

  if (!username) {
    return NextResponse.json(
      { success: false, message: "Username is required" },
      { status: 400 }
    );
  }

  const result = await loginService({ username } as LoginRequest);

  if (result.success) {
    return NextResponse.json(result, { status: 200 });
  }
  return NextResponse.json(result, { status: 401 });
}
