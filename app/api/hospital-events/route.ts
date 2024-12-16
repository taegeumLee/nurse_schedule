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

    const events = await prisma.hospitalEvent.findMany({
      orderBy: {
        start: "asc",
      },
    });

    const formattedEvents = events.map((event) => ({
      ...event,
      start: event.start.toISOString().split("T")[0],
      end: event.end.toISOString().split("T")[0],
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("Hospital events error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
