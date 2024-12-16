import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberIds = searchParams.get("memberIds")?.split(",") || [];

    if (!memberIds.length) {
      return NextResponse.json(
        { message: "멤버 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        userId: {
          in: memberIds,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedSchedules = schedules.map((schedule) => ({
      id: schedule.id,
      userId: schedule.userId,
      userName: schedule.user.name,
      date: schedule.date.toISOString().split("T")[0],
      shiftType: schedule.shiftType,
    }));

    return NextResponse.json(formattedSchedules);
  } catch (error) {
    console.error("Schedules fetch error:", error);
    return NextResponse.json(
      { message: "스케줄을 가져오는데 실패했습니다." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
