import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/ids";
import { SESSION_COOKIE_NAME, sessionCookieOptions, signSession } from "@/lib/auth";
import {
  facebookOAuthUrl,
  facebookAppId,
  facebookAppSecret,
  exchangeFacebookCode,
} from "@/lib/oauth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const errorParam = url.searchParams.get("error");

  // ── Callback ──────────────────────────────────────────────
  if (code || errorParam) {
    if (errorParam) {
      return NextResponse.redirect(new URL(`/dang-nhap?oauth_error=${encodeURIComponent(errorParam)}`, req.url));
    }

    const state = url.searchParams.get("state");
    if (!state) {
      return NextResponse.redirect(new URL("/dang-nhap?oauth_error=no_state", req.url));
    }

    const db = getDb();
    const stateRow = await db
      .prepare("SELECT * FROM oauth_states WHERE state = ? AND provider = 'facebook' LIMIT 1")
      .bind(state)
      .first<{ id: string; redirect_to: string; expires_at: number }>();

    if (!stateRow) {
      return NextResponse.redirect(new URL("/dang-nhap?oauth_error=invalid_state", req.url));
    }

    const now = Math.floor(Date.now() / 1000);
    if (now > stateRow.expires_at) {
      await db.prepare("DELETE FROM oauth_states WHERE id = ?").bind(stateRow.id).run();
      return NextResponse.redirect(new URL("/dang-nhap?oauth_error=state_expired", req.url));
    }

    await db.prepare("DELETE FROM oauth_states WHERE id = ?").bind(stateRow.id).run();

    const authCode: string = code!;
    let userData: Awaited<ReturnType<typeof exchangeFacebookCode>>;
    try {
      userData = await exchangeFacebookCode(authCode);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "OAuth_error";
      return NextResponse.redirect(
        new URL(`/dang-nhap?oauth_error=${encodeURIComponent(msg.slice(0, 80))}`, req.url),
      );
    }

    const existing = await db
      .prepare("SELECT id, email, role FROM users WHERE email = ? LIMIT 1")
      .bind(userData.email.toLowerCase())
      .first<{ id: string; email: string; role: string }>();

    let userId: string;
    if (existing) {
      userId = existing.id;
    } else {
      userId = newId();
      const now = Math.floor(Date.now() / 1000);
      await db
        .prepare(
          `INSERT INTO users (id, email, password_hash, name, role, email_verified_at, seller_status, kyc_status, created_at, updated_at)
           VALUES (?, ?, 'oauth:facebook', ?, 'user', ?, 'none', 'none', ?, ?)`,
        )
        .bind(userId, userData.email.toLowerCase(), userData.name, now, now, now)
        .run();
    }

    const jwt = await signSession({ userId, email: userData.email.toLowerCase(), role: "user" });
    const redirectTo = stateRow.redirect_to || "/tai-khoan";

    const res = NextResponse.redirect(new URL(redirectTo, req.url));
    res.cookies.set(SESSION_COOKIE_NAME, jwt, sessionCookieOptions(60 * 60 * 24 * 7));
    return res;
  }

  // ── Initiate — redirect to Facebook ──────────────────────
  const [appId, appSecret] = await Promise.all([facebookAppId(), facebookAppSecret()]);
  if (!appId || !appSecret) {
    return NextResponse.json({ error: "Facebook OAuth chưa được cấu hình" }, { status: 503 });
  }

  const db = getDb();
  const state = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const stateId = newId();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 600;

  const reqUrl = new URL(req.url);
  const next = reqUrl.searchParams.get("next") || "/tai-khoan";

  await db
    .prepare(
      `INSERT INTO oauth_states (id, state, redirect_to, provider, expires_at, created_at)
       VALUES (?, ?, ?, 'facebook', ?, ?)`,
    )
    .bind(stateId, state, next, expiresAt, now)
    .run();

  const authUrl = await facebookOAuthUrl(state);
  return NextResponse.redirect(new URL(authUrl));
}
