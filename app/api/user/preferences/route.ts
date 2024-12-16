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
    const { preferredOffDaysPerMonth, shiftPreference } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId as string },
      data: {
        preferredOffDaysPerMonth,
        shiftPreference,
      },
    });

    return NextResponse.json({
      preferredOffDaysPerMonth: updatedUser.preferredOffDaysPerMonth,
      shiftPreference: updatedUser.shiftPreference,
    });
  } catch (error) {
    console.error("Preferences update error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
