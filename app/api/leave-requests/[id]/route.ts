import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
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
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: params.id },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { message: "휴무 신청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (leaveRequest.userId !== decoded.userId) {
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    await prisma.leaveRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "휴무 신청이 취소되었습니다." });
  } catch (error) {
    console.error("Leave request deletion error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
