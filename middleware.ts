import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import * as jose from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  type Role = "ADMIN" | "MANAGER" | "NURSE";
  const rolePages: Record<Role, string> = {
    ADMIN: "/admin",
    MANAGER: "/manager",
    NURSE: "/nurse",
  };

  // 로그인/회원가입 페이지 접근 시 이미 로그인된 사용자 리다이렉트
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (token) {
      try {
        const decoded = jose.decodeJwt(token.value);
        const role = decoded.role as Role;

        return NextResponse.redirect(new URL(rolePages[role], request.url));
      } catch (error) {
        // 토큰이 유효하지 않은 경우 쿠키 삭제
        const response = NextResponse.next();
        response.cookies.delete("token");
        return response;
      }
    }
  }

  // 보호된 경로 접근 시 로그인 체크
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/manager") ||
    pathname.startsWith("/nurse")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = jose.decodeJwt(token.value);
      const role = decoded.role as Role;

      // 권한에 맞지 않는 페이지 접근 시 리다이렉트
      if (
        (pathname.startsWith("/admin") && role !== "ADMIN") ||
        (pathname.startsWith("/manager") && role !== "MANAGER") ||
        (pathname.startsWith("/nurse") && role !== "NURSE")
      ) {
        return NextResponse.redirect(new URL(rolePages[role], request.url));
      }
    } catch (error) {
      // 토큰이 유효하지 않은 경우
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/admin/:path*",
    "/manager/:path*",
    "/nurse/:path*",
  ],
};
