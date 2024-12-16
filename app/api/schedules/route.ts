import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    const decoded = jose.decodeJwt(token.value);
    const schedules = await prisma.schedule.findMany({
      where: {
        userId: decoded.userId as string,
      },
      select: {
        id: true,
        date: true,
        shiftType: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const formattedSchedules = schedules.map((schedule) => ({
      ...schedule,
      date: schedule.date.toISOString().split("T")[0],
    }));

    return NextResponse.json(formattedSchedules);
  } catch (error) {
    console.error("Schedules error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
