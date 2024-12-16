import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as jose from "jose";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (token) {
    try {
      const decoded = jose.decodeJwt(token.value);
      const role = decoded.role as "ADMIN" | "MANAGER" | "NURSE";

      const rolePages = {
        ADMIN: "/admin",
        MANAGER: "/manager",
        NURSE: "/nurse",
      } as const;

      redirect(rolePages[role]);
    } catch (error) {
      redirect("/login");
    }
  }

  redirect("/login");
}
