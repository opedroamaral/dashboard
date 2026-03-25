import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getAdAccounts,
} from "@/lib/facebook";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/settings?error=facebook_denied", request.url)
    );
  }

  const storedState = request.cookies.get("fb_oauth_state")?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/settings?error=invalid_state", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/settings?error=no_code", request.url)
    );
  }

  try {
    const shortToken = await exchangeCodeForToken(code);
    const longToken = await getLongLivedToken(shortToken.access_token);

    const expiresAt = longToken.expires_in
      ? new Date(Date.now() + longToken.expires_in * 1000)
      : null;

    const accounts = await getAdAccounts(longToken.access_token);

    for (const account of accounts) {
      const rawId = account.id.replace("act_", "");
      await prisma.facebookAccount.upsert({
        where: { accountId: rawId },
        create: {
          accountId: rawId,
          accessToken: longToken.access_token,
          tokenExpiresAt: expiresAt,
        },
        update: {
          accessToken: longToken.access_token,
          tokenExpiresAt: expiresAt,
        },
      });
    }

    const response = NextResponse.redirect(
      new URL("/settings?connected=true", request.url)
    );
    response.cookies.delete("fb_oauth_state");
    return response;
  } catch (err) {
    console.error("[facebook/callback] Error:", err);
    return NextResponse.redirect(
      new URL("/settings?error=token_exchange_failed", request.url)
    );
  }
}
