const wrap = (title: string, bodyHtml: string) => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f8f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f8f6;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e3ebe7;">
            <tr>
              <td style="background:#0b4233;padding:28px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;">Bensal Investment Co. Ltd.</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:18px;color:#0b1512;">${title}</h1>
                <div style="font-size:14px;line-height:1.7;color:#3d4a45;">${bodyHtml}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f4f8f6;font-size:12px;color:#7c8a85;">
                IPS Building, Azikiwe Street, Dar es Salaam, Tanzania · md@bensal.co.tz
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const row = (label: string, value: string) =>
  `<p style="margin:0 0 10px;"><strong style="color:#0b4233;">${label}:</strong> ${value}</p>`;

export function contactAdminEmail(data: {
  fullName: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}) {
  return wrap(
    "New contact form submission",
    [
      row("Name", data.fullName),
      data.company ? row("Company", data.company) : "",
      row("Email", data.email),
      data.phone ? row("Phone", data.phone) : "",
      row("Subject", data.subject),
      `<p style="margin:16px 0 0;white-space:pre-wrap;">${data.message}</p>`,
    ].join("")
  );
}

export function contactConfirmationEmail(fullName: string) {
  return wrap(
    "We've received your message",
    `<p>Hi ${fullName},</p><p>Thank you for reaching out to Bensal Investment Co. Ltd. Our team has received your message and will get back to you shortly.</p><p>Best regards,<br/>Bensal Investment Co. Ltd.</p>`
  );
}

export function careerAdminEmail(data: {
  fullName: string;
  email: string;
  phone: string;
  jobTitle?: string;
}) {
  return wrap(
    "New job application",
    [
      row("Name", data.fullName),
      row("Email", data.email),
      row("Phone", data.phone),
      data.jobTitle ? row("Position", data.jobTitle) : "",
    ].join("")
  );
}

export function careerConfirmationEmail(fullName: string) {
  return wrap(
    "Application received",
    `<p>Hi ${fullName},</p><p>Thank you for applying to Bensal Investment Co. Ltd. We have received your application and will review it shortly.</p><p>Best regards,<br/>Bensal Investment Co. Ltd.</p>`
  );
}
