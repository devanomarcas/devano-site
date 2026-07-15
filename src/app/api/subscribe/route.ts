import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validação simples de e-mail
    if (!email || typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Insere o inscrito. Se já existir (e-mail duplicado), trata como sucesso.
    const { error } = await supabase
      .from("inscritos")
      .insert({ email: email.toLowerCase().trim() });

    if (error) {
      // Código 23505 = violação de unicidade (e-mail já cadastrado). Não é erro para o usuário.
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, jaInscrito: true });
      }
      console.error("Erro ao inserir inscrito:", error);
      return NextResponse.json({ error: "Não foi possível concluir." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
}
