import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { AuthTokenType } from "./lib/enums";
import { env } from "./lib/zod";

export const config = {
  matcher: ["/api/:path*"],
};

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const tokenType = req.headers.get("x-token-type");

  // Skip auth check for sign-in endpoint
  if (
    pathname === "/api/auth/farcaster/sign-in" ||
    pathname === "/api/auth/farcaster/fake-sign-in" ||
    pathname === "/api/auth/base/sign-in" ||
    pathname === "/api/auth/web-app/sign-in" ||
    pathname === "/api/auth/base/nonce" ||
    pathname === "/api/auth/logout" ||
    pathname === "/api/current-time" ||
    pathname.includes("/api/og") ||
    pathname.includes("/api/webhook/farcaster") ||
    pathname.includes("/api/kalshi/get") //TODO: Remove this after testing
  ) {
    return NextResponse.next();
  }

  // skip auth check for GET requests to active bullmeters with a dynamic brandId
  if (
    /^\/api\/bullmeters\/active\/[^\/]+$/.test(pathname) &&
    req.method === "GET"
  ) {
    return NextResponse.next();
  }

  // skip auth check for GET requests to hosts with a dynamic brandId
  if (/^\/api\/hosts\/[^\/]+$/.test(pathname) && req.method === "GET") {
    return NextResponse.next();
  }

  // skip auth check for GET requests to youtube content with a dynamic slug
  if (
    /^\/api\/last-youtube-content\/[^\/]+$/.test(pathname) &&
    req.method === "GET"
  ) {
    return NextResponse.next();
  }

  // skip auth check for GET requests to brand with a dynamic slug
  if (/^\/api\/brands\/[^\/]+$/.test(pathname) && req.method === "GET") {
    return NextResponse.next();
  }

  // skip auth check for GET requests to tip-settings
  if (pathname === "/api/tip-settings" && req.method === "GET") {
    return NextResponse.next();
  }

  // skip auth check for GET requests to featured-tokens
  if (pathname === "/api/featured-tokens" && req.method === "GET") {
    return NextResponse.next();
  }

  // Get token from auth_token cookie based on the token type
  // received by the header (it was set in each api call)
  const authToken =
    tokenType === AuthTokenType.WEB_APP_AUTH_TOKEN
      ? req.cookies.get(AuthTokenType.WEB_APP_AUTH_TOKEN)?.value
      : tokenType === AuthTokenType.MINI_APP_AUTH_TOKEN
        ? req.cookies.get(AuthTokenType.MINI_APP_AUTH_TOKEN)?.value
        : req.cookies.get(AuthTokenType.ADMIN_AUTH_TOKEN)?.value;

  if (!authToken) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    // Verify the token using jose
    const { payload } = await jose.jwtVerify(authToken, secret);

    // Clone the request headers to add user info
    const requestHeaders = new Headers(req.headers);
    if (payload.fid !== null && payload.fid !== undefined) {
      requestHeaders.set("x-user-fid", payload.fid as string);
    }
    // Always set wallet address if it exists (even for users without Farcaster accounts)
    if (payload.walletAddress) {
      requestHeaders.set(
        "x-user-wallet-address",
        payload.walletAddress as string,
      );
    }

    // Return response with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error(error);

    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete("x-user-fid");
    requestHeaders.delete("x-user-wallet-address");

    return NextResponse.json(
      { error: "Invalid token" },
      {
        status: 401,
        headers: requestHeaders,
      },
    );
  }
}
