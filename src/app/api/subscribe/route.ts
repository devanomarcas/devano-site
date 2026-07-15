import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  // 1) Ler o corpo de forma robusta
  let email: unknown;
  try {
    const body = await request.json();
    email = body?.email;
  } catch {
    // Tenta ler como texto puro, caso o content-type venha diferente
    try {
      const texto = await request.text();
      const params = new URLSearchParams(texto);
      email = params.get("email") ?? undefined;
    } catch {
      return NextResponse.json(
        { error: "Não foi possível ler o e-mail enviado." },
        { status: 400 }
      );
    }
  }

  // 2) Validar
  if (
    !email ||
    typeof email !== "string" ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  ) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  // 3) Checar se a chave secreta está presente (diagnóstico claro)
  if (!process.env.SUPABASE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Configuração ausente: SUPABASE_SECRET_KEY não encontrada." },
      { status: 500 }
    );
  }

  // 4) Inserir no banco
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("inscritos")
      .insert({ email: email.toLowerCase().trim() });

    if (error) {
      // E-mail já cadastrado — tratamos como sucesso.
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, jaInscrito: true });
      }
      // Retorna a mensagem REAL do Supabase para diagnóstico.
      return NextResponse.json(
        { error: `Banco: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erro desconhecido";
    return NextResponse.json({ error: `Falha: ${msg}` }, { status: 500 });
  }
}
