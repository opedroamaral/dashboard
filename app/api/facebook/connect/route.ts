import { NextRequest, NextResponse } from "next/server";
import { getFacebookOAuthURL } from "@/lib/facebook";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  const state = randomBytes(16).toString("hex");

  const url = getFacebookOAuthURL(state);

  const response = NextResponse.redirect(url);
  response.cookies.set("fb_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
