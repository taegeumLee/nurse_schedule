import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const group = await prisma.group.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        inviteCode: true,
        members: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { message: "그룹을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 그룹 멤버인�� 확인
    const isMember = group.members.some((member) => member.id === userId);
    if (!isMember) {
      return NextResponse.json(
        { message: "접근 권한이 없습니다." },
        { status: 403 }
      );
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Group detail error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
