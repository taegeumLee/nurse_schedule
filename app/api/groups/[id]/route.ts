import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import { join } from "path";

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
        imageUrl: true,
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

    // 그룹 멤버인지 확인
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image");

    let imageUrl = undefined;

    if (image && image instanceof Blob) {
      // 파일 저장 경로 생성
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.jpg`;
      const uploadDir = join(process.cwd(), "public", "uploads");
      const filepath = join(uploadDir, filename);

      try {
        await writeFile(filepath, buffer);
        imageUrl = `/uploads/${filename}`;
      } catch (error) {
        console.error("File write error:", error);
        throw new Error("이미지 저장에 실패했습니다.");
      }
    }

    const group = await prisma.group.update({
      where: { id: params.id },
      data: {
        name,
        description,
        ...(imageUrl && { imageUrl }),
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("Group update error:", error);
    return NextResponse.json(
      { message: "그룹 정보 수정에 실패했습니다." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
