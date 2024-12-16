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
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        userId: decoded.userId as string,
      },
      select: {
        id: true,
        date: true,
        reason: true,
        status: true,
        comment: true,
        type: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedRequests = leaveRequests.map((request) => ({
      ...request,
      date: request.date.toISOString().split("T")[0],
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error("Leave requests error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

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
    const { date, reason, type } = await request.json();

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: decoded.userId as string,
        date: new Date(date),
        reason,
        type,
      },
    });

    const formattedRequest = {
      ...leaveRequest,
      date: leaveRequest.date.toISOString().split("T")[0],
    };

    return NextResponse.json(formattedRequest, { status: 201 });
  } catch (error) {
    console.error("Leave request creation error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
