const SITE = "https://www.devanobranding.com";
const LOGO = `${SITE}/brand/logo-musgo.png`;

/**
 * Converte o texto escrito no painel (parágrafos separados por linha em branco)
 * em HTML de e-mail. Suporta subtítulos com "## " no início da linha.
 */
export function textoParaHtml(texto: string): string {
  const blocos = texto
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocos
    .map((bloco) => {
      if (bloco.startsWith("## ")) {
        const titulo = escapeHtml(bloco.slice(3).trim());
        return `<h2 style="margin:36px 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:#1a1c19;font-weight:600;">${titulo}</h2>`;
      }
      if (bloco.startsWith("> ")) {
        const citacao = escapeHtml(bloco.slice(2).trim()).replace(/\n/g, "<br>");
        return `<blockquote style="margin:28px 0;padding-left:20px;border-left:2px solid #434d42;font-style:italic;color:#434d42;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.6;">${citacao}</blockquote>`;
      }
      const paragrafo = escapeHtml(bloco).replace(/\n/g, "<br>");
      return `<p style="margin:0 0 20px 0;">${paragrafo}</p>`;
    })
    .join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Monta o e-mail completo da Marketeiros, no visual da Devano.
 * `corpoHtml` já vem pronto de textoParaHtml().
 */
export function montarEmail({
  titulo,
  corpoHtml,
  unsubscribeUrl = "#",
}: {
  titulo: string;
  corpoHtml: string;
  unsubscribeUrl?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(titulo)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f1ef;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f1ef;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <tr>
            <td style="padding:8px 40px 0 40px;">
              <img src="${LOGO}" alt="Devano" width="120" style="display:block;width:120px;height:auto;border:0;">
              <p style="margin:14px 0 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9a9a92;">
                Marketeiros — por Lucas Mooneyhan
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px 0 40px;">
              <div style="border-top:1px solid rgba(26,28,25,0.14);"></div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px 0 40px;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#1a1c19;font-weight:500;letter-spacing:-0.5px;">
                ${escapeHtml(titulo)}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px 0 40px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.75;color:#2a2c28;">
              ${corpoHtml}
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px 0 40px;">
              <div style="border-top:1px solid rgba(26,28,25,0.14);padding-top:24px;">
                <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.5;color:#6e726b;">
                  Escrito por <strong style="color:#1a1c19;">Lucas Mooneyhan</strong><br>
                  Fundador e diretor estratégico da Devano
                </p>
                <p style="margin:18px 0 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;">
                  <a href="${SITE}" style="color:#434d42;text-decoration:underline;">devanobranding.com</a>
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 24px 40px;">
              <div style="border-top:1px solid rgba(26,28,25,0.08);padding-top:20px;">
                <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:1.6;color:#9a9a92;">
                  Você recebe a Marketeiros porque se inscreveu em devanobranding.com.<br>
                  Marketeiros chega todo domingo, às 9h.<br>
                  <a href="${unsubscribeUrl}" style="color:#9a9a92;text-decoration:underline;">Cancelar inscrição</a>
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
