import prisma from "@/lib/prisma";
import { Prisma } from "generated";

export async function getAllUserService({
  page = 1,
  perPage = 10,
  search = "",
  orderByField = "id",
  orderByDirection = "desc",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  orderByField?: string;
  orderByDirection?: "asc" | "desc";
}) {
  try {
    const where: Prisma.userWhereInput = {
      OR: [
        {
          name: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
          },
        },
      ],
      status: {
        equals: "ENABLE",
      },
    };

    // Build orderBy object dynamically
    const orderBy: Prisma.userOrderByWithRelationInput = {
      [orderByField]: orderByDirection,
    };

    const total = await prisma.user.count({ where });
    const data = await prisma.user.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy,
    });

    return {
      success: true,
      message: "User fetched successfully",
      total,
      data,
      page,
      perPage,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      message: "Failed to fetch user",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
