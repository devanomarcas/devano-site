import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { montarEmail, textoParaHtml } from "@/lib/email-template";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const titulo = String(body?.titulo ?? "Sem título").trim();
    const texto = String(body?.texto ?? "").trim();
    const html = montarEmail({ titulo, corpoHtml: textoParaHtml(texto) });
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
}
