import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { montarEmail, textoParaHtml } from "@/lib/email-template";

export const maxDuration = 60;

export async function POST(request: Request) {
  // 1) Só usuários logados podem enviar
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  // 2) Conferir configuração
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Configuração ausente: RESEND_API_KEY não encontrada." },
      { status: 500 }
    );
  }
  const remetente = process.env.NEWSLETTER_FROM;
  if (!remetente) {
    return NextResponse.json(
      { error: "Configuração ausente: NEWSLETTER_FROM não encontrada." },
      { status: 500 }
    );
  }

  // 3) Ler os dados
  let titulo = "";
  let texto = "";
  let modo: "teste" | "envio" = "teste";
  let emailTeste = "";
  try {
    const body = await request.json();
    titulo = String(body?.titulo ?? "").trim();
    texto = String(body?.texto ?? "").trim();
    modo = body?.modo === "envio" ? "envio" : "teste";
    emailTeste = String(body?.emailTeste ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  if (!titulo || !texto) {
    return NextResponse.json(
      { error: "Preencha o título e o texto." },
      { status: 400 }
    );
  }

  const html = montarEmail({ titulo, corpoHtml: textoParaHtml(texto) });
  const resend = new Resend(process.env.RESEND_API_KEY);

  // 4) MODO TESTE — envia só para um endereço
  if (modo === "teste") {
    const destino = emailTeste || user.email;
    if (!destino) {
      return NextResponse.json(
        { error: "Informe um e-mail para o teste." },
        { status: 400 }
      );
    }
    const { error } = await resend.emails.send({
      from: remetente,
      to: [destino],
      subject: `[TESTE] ${titulo}`,
      html,
    });
    if (error) {
      return NextResponse.json(
        { error: `Resend: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, enviados: 1, teste: true });
  }

  // 5) MODO ENVIO — dispara para todos os inscritos
  const admin = createAdminClient();
  const { data: inscritos, error: erroLista } = await admin
    .from("inscritos")
    .select("email");

  if (erroLista) {
    return NextResponse.json(
      { error: `Banco: ${erroLista.message}` },
      { status: 500 }
    );
  }
  if (!inscritos || inscritos.length === 0) {
    return NextResponse.json(
      { error: "Não há inscritos para enviar." },
      { status: 400 }
    );
  }

  // Envia em lotes para respeitar limites do Resend
  const emails = inscritos.map((i) => i.email as string);
  const lotes: string[][] = [];
  const TAMANHO_LOTE = 50;
  for (let i = 0; i < emails.length; i += TAMANHO_LOTE) {
    lotes.push(emails.slice(i, i + TAMANHO_LOTE));
  }

  let enviados = 0;
  const falhas: string[] = [];

  for (const lote of lotes) {
    const resultados = await Promise.allSettled(
      lote.map((destino) =>
        resend.emails.send({
          from: remetente,
          to: [destino],
          subject: titulo,
          html,
        })
      )
    );
    resultados.forEach((r, idx) => {
      if (r.status === "fulfilled" && !r.value.error) {
        enviados++;
      } else {
        falhas.push(lote[idx]);
      }
    });
  }

  // 6) Registrar a edição enviada
  await admin.from("edicoes").insert({
    titulo,
    texto,
    enviados,
    enviado_em: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, enviados, falhas: falhas.length });
}
