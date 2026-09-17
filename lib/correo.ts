const API_RESEND = "https://api.resend.com/emails";
const VERDE = "#2D6A4F";
const TEXTO = "#1B4332";
const MUTED = "#6B9E7A";

export type Envio = { ok: true; id: string } | { ok: false; error: string };

export function plantillaVerificacion(enlace: string): string {
  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:32px 16px;background:#F8FAF9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#FFFFFF;border-radius:14px;padding:32px;">
    <tr><td>
      <h1 style="margin:0 0 8px;font-size:24px;color:${TEXTO};">🌿 Confirma tu correo</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${MUTED};">
        Creaste una cuenta en Plantfolio. Confirma que este correo es tuyo para seguir.
      </p>
      <a href="${enlace}" style="display:inline-block;background:${VERDE};color:#FFFFFF;text-decoration:none;padding:13px 26px;border-radius:9px;font-weight:600;font-size:15px;">
        Confirmar mi correo
      </a>
      <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:${MUTED};">
        Si el botón no funciona, copia esta dirección en tu navegador:<br>
        <span style="color:${TEXTO};word-break:break-all;">${enlace}</span>
      </p>
      <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:${MUTED};">
        El enlace vence en 24 horas. Después de confirmar, un administrador tiene que
        habilitar tu cuenta antes de que puedas entrar.
      </p>
      <p style="margin:24px 0 0;font-size:12px;color:${MUTED};">
        Si no fuiste tú, ignora este correo.
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

export function plantillaAprobacion(): string {
  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:32px 16px;background:#F8FAF9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#FFFFFF;border-radius:14px;padding:32px;">
    <tr><td>
      <h1 style="margin:0 0 8px;font-size:24px;color:${TEXTO};">🌿 Tu cuenta está lista</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${MUTED};">
        Un administrador habilitó tu cuenta de Plantfolio. Ya puedes entrar y empezar a
        coleccionar plantas.
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function enviarCorreo(para: string, asunto: string, html: string): Promise<Envio> {
  const clave = process.env.RESEND_API_KEY;
  const remitente = process.env.CORREO_REMITENTE;

  if (!clave || !remitente) {
    return { ok: false, error: "El envío de correos no está configurado." };
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(API_RESEND, {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: remitente, to: [para], subject: asunto, html }),
    });
  } catch {
    return { ok: false, error: "No pudimos contactar al servicio de correo." };
  }

  const cuerpo = (await respuesta.json().catch(() => null)) as
    | { id?: string; message?: string }
    | null;

  if (!respuesta.ok) {
    if (respuesta.status === 403) {
      return {
        ok: false,
        error:
          "El remitente de prueba solo puede escribirle a la cuenta dueña de Resend. Verifica un dominio para escribir a cualquiera.",
      };
    }
    return { ok: false, error: cuerpo?.message ?? "No se pudo enviar el correo." };
  }

  return { ok: true, id: cuerpo?.id ?? "" };
}
