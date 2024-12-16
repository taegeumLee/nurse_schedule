import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
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
    const userId = decoded.userId as string;
    const { preferredOffDaysPerMonth, shiftPreference } = await request.json();

    // 입력값 검증
    if (
      typeof preferredOffDaysPerMonth !== "number" ||
      preferredOffDaysPerMonth < 0
    ) {
      return NextResponse.json(
        { message: "유효하지 않은 희망 오프 일수입니다." },
        { status: 400 }
      );
    }

    if (!shiftPreference || typeof shiftPreference !== "string") {
      return NextResponse.json(
        { message: "유효하지 않은 근무 선호도입니다." },
        { status: 400 }
      );
    }

    // 사용자 존재 여부 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 데이터 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        preferredOffDaysPerMonth,
        shiftPreference,
      },
      select: {
        preferredOffDaysPerMonth: true,
        shiftPreference: true,
      },
    });
    console.log(updatedUser);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Preferences update error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
