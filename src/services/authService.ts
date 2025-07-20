import prisma from "../lib/prisma";
import { signJwt } from "../utils/jtw";
import { LoginRequest } from "@/model/requests/LoginRequest";
import { LoginResponse } from "@/model/responses/LoginResponse";

export async function loginService({ username }: LoginRequest) {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
      },
    },
  });

  const loginResponse: LoginResponse = {
    success: true,
    message: "Login successful",
  };

  if (!user) {
    loginResponse.success = false;
    loginResponse.message = "User not found";
    return loginResponse;
  }

  const token = signJwt({
    id: user.id,
    email: user.email,
    name: user.name ? user.name : "",
    username: user.username ? user.username : "",
    role_name: user.role_name ? user.role_name : "",
    role_id: user.role_id ? user.role_id : 0,
    verified: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  loginResponse.token = token;
  loginResponse.user = {
    id: user.id,
    email: user.email ? user.email : "",
    name: user.name ? user.name : "",
    username: user.username ? user.username : "",
    role_name: user.role_name ? user.role_name : "",
    role_id: user.role_id ? user.role_id : 0,
  };

  return loginResponse;
}
