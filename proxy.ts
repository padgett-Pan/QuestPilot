import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 页面级快速门禁。
 *
 * 注意：proxy 运行在 Edge 运行时，无法读取 node:fs，因此这里只做 cookie
 * 存在性判断，不能校验 session 是否真实有效。真正的有效性校验发生在：
 *  - 服务端页面：app/dashboard/page.tsx 调用 getCurrentUser() 并 redirect
 *  - 业务 API：lib/api-auth.ts 的 requireApiUser()
 * 两者失效时分别回落到登录页 / HTTP 401。
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("questpilot_session")) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/plan/:path*",
    "/knowledge/:path*",
    "/review/:path*",
    "/team/:path*",
    "/comments/:path*",
    "/settings/:path*",
    "/help/:path*",
  ],
};
