import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
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
    const { inviteCode } = await request.json();

    const group = await prisma.group.findUnique({
      where: { inviteCode },
    });

    if (!group) {
      return NextResponse.json(
        { message: "유효하지 않은 초대 코드입니다." },
        { status: 404 }
      );
    }

    await prisma.group.update({
      where: { id: group.id },
      data: {
        members: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json({ groupId: group.id });
  } catch (error) {
    console.error("Group join error:", error);
    return NextResponse.json(
      { message: "그룹 참여 중 오류가 발생했습니다." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
