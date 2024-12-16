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
    const { name, description } = await request.json();

    const group = await prisma.group.create({
      data: {
        name,
        description,
        admins: {
          connect: { id: userId },
        },
        members: {
          connect: { id: userId },
        },
      },
      select: {
        id: true,
        inviteCode: true,
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("Group creation error:", error);
    return NextResponse.json(
      { message: "그룹 성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
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

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        members: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json(
      groups.map((group) => ({
        ...group,
        memberCount: group._count.members,
      }))
    );
  } catch (error) {
    console.error("Groups fetch error:", error);
    return NextResponse.json(
      { message: "그룹 목록을 가져오는데 실패했습니다." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
