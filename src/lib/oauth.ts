import { getSetting } from "@/lib/settings";

export type OProvider = "google" | "facebook";

export async function googleClientId(): Promise<string> {
  return await getSetting("google_client_id");
}

export async function googleClientSecret(): Promise<string> {
  return await getSetting("google_client_secret");
}

export async function facebookAppId(): Promise<string> {
  return await getSetting("facebook_app_id");
}

export async function facebookAppSecret(): Promise<string> {
  return await getSetting("facebook_app_secret");
}

export async function appUrl(): Promise<string> {
  return (await getSetting("app_url")) || "https://khomanguon.io.vn";
}

export async function isOAuthConfigured(provider: OProvider): Promise<boolean> {
  if (provider === "google") {
    const [id, secret] = await Promise.all([googleClientId(), googleClientSecret()]);
    return Boolean(id && secret);
  }
  if (provider === "facebook") {
    const [id, secret] = await Promise.all([facebookAppId(), facebookAppSecret()]);
    return Boolean(id && secret);
  }
  return false;
}

export async function googleOAuthUrl(state: string): Promise<string> {
  const [clientId, url] = await Promise.all([googleClientId(), appUrl()]);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${url}/api/auth/oauth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function facebookOAuthUrl(state: string): Promise<string> {
  const [appId, url] = await Promise.all([facebookAppId(), appUrl()]);
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: `${url}/api/auth/oauth/facebook/callback`,
    state,
    scope: "email,public_profile",
    response_type: "code",
  });
  return `https://www.facebook.com/v20.0/dialog/oauth?${params}`;
}

export async function exchangeGoogleCode(code: string): Promise<{
  email: string;
  name: string;
  id: string;
}> {
  const [clientId, clientSecret, url] = await Promise.all([
    googleClientId(), googleClientSecret(), appUrl(),
  ]);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${url}/api/auth/oauth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Google token: ${res.status} — ${t.slice(0, 300)}`);
  }
  const tokens = (await res.json()) as { access_token?: string };
  const access = tokens.access_token;
  if (!access) throw new Error("Google không trả access_token");

  const info = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!info.ok) throw new Error("Google userinfo: " + info.status);
  const userInfo = (await info.json()) as { email?: string; name?: string; id?: string };
  if (!userInfo.email || !userInfo.id) throw new Error("Google thiếu email/id");
  return { email: userInfo.email, name: userInfo.name || userInfo.email.split("@")[0], id: userInfo.id };
}

export async function exchangeFacebookCode(code: string): Promise<{
  email: string;
  name: string;
  id: string;
}> {
  const [appId, appSecret, url] = await Promise.all([
    facebookAppId(), facebookAppSecret(), appUrl(),
  ]);

  const tokenRes = await fetch(
    `https://graph.facebook.com/v20.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: appId,
        redirect_uri: `${url}/api/auth/oauth/facebook/callback`,
        client_secret: appSecret,
        code,
      }),
  );
  if (!tokenRes.ok) {
    const t = await tokenRes.text();
    throw new Error(`Facebook access_token: ${tokenRes.status} — ${t.slice(0, 300)}`);
  }
  const tokens = (await tokenRes.json()) as { access_token?: string };
  const access = tokens.access_token;
  if (!access) throw new Error("Facebook không trả access_token");

  const infoRes = await fetch(
    `https://graph.facebook.com/v20.0/me?` +
      new URLSearchParams({ access_token: access, fields: "id,name,email" }),
  );
  if (!infoRes.ok) throw new Error("Facebook me: " + infoRes.status);
  const userInfo = (await infoRes.json()) as { id?: string; name?: string; email?: string };
  if (!userInfo.id) throw new Error("Facebook thiếu id");
  return {
    email: userInfo.email || `${userInfo.id}@facebook.fake`,
    name: userInfo.name || userInfo.id,
    id: userInfo.id,
  };
}
