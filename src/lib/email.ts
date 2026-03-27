import { getSetting } from "@/lib/settings";

const APP_URL_FALLBACK = "https://khomanguon.io.vn";

export async function getAppUrl(): Promise<string> {
  return (await getSetting("app_url")) || APP_URL_FALLBACK;
}

export async function sendTransactionalEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const key = await getSetting("resend_api_key");
  const from = (await getSetting("email_from")) || "Kho Mã Nguồn <noreply@khomanguon.io.vn>";

  if (!key) {
    console.info("[email:dev]", opts.to, opts.subject, opts.html.slice(0, 200));
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gửi email thất bại: ${t}`);
  }
}

export function verificationEmailHtml(token: string, appUrl: string): string {
  const link = `${appUrl}/xac-thuc-email?token=${encodeURIComponent(token)}`;
  return `
    <p>Xin chào,</p>
    <p>Vui lòng xác nhận email để kích hoạt tài khoản Kho Mã Nguồn:</p>
    <p><a href="${link}">${link}</a></p>
    <p>Liên kết có hiệu lực trong 24 giờ.</p>
  `;
}

export function otpWithdrawHtml(code: string): string {
  return `
    <p>Mã OTP rút tiền của bạn:</p>
    <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p>
    <p>Mã có hiệu lực 15 phút. Không chia sẻ cho bất kỳ ai.</p>
  `;
}

export function forgotPasswordHtml(code: string, appUrl: string): string {
  return `
    <p>Xin chào,</p>
    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Kho Mã Nguồn.</p>
    <p>Mã OTP của bạn:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#16a34a">${code}</p>
    <p>Mã có hiệu lực trong <strong>15 phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
  `;
}
