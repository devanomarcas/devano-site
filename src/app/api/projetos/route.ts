import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Cria projeto com suas fases, move fase, salva observação, ou apaga.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let corpo: any;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const admin = createAdminClient();
  const acao = corpo.acao;

  try {
    // ---- Criar projeto novo com fases ----
    if (acao === "criar") {
      const { nome, cliente, tipo, fases } = corpo;
      if (!nome || !tipo || !Array.isArray(fases) || fases.length === 0) {
        return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
      }
      const { data: proj, error: e1 } = await admin
        .from("projetos")
        .insert({ nome, cliente: cliente || null, tipo, fase_atual: 0, observacao: "" })
        .select()
        .single();
      if (e1) throw e1;

      const fasesInsert = fases.map((f: any, i: number) => ({
        projeto_id: proj.id,
        nome: f.nome,
        ordem: i,
        inicio: f.inicio || null,
        fim: f.fim || null,
      }));
      const { error: e2 } = await admin.from("fases").insert(fasesInsert);
      if (e2) throw e2;

      // participantes (informativo) — array de perfil_id
      if (Array.isArray(corpo.participantes) && corpo.participantes.length > 0) {
        const parts = corpo.participantes.map((pid: string) => ({
          projeto_id: proj.id,
          perfil_id: pid,
        }));
        await admin.from("participantes").insert(parts);
      }

      revalidatePath("/admin/projetos");
      return NextResponse.json({ ok: true, id: proj.id });
    }

    // ---- Mover fase (avançar/voltar) ----
    if (acao === "mover") {
      const { id, novaFase } = corpo;
      const { error } = await admin
        .from("projetos")
        .update({ fase_atual: novaFase })
        .eq("id", id);
      if (error) throw error;
      revalidatePath("/admin/projetos");
      return NextResponse.json({ ok: true });
    }

    // ---- Salvar observação ----
    if (acao === "observacao") {
      const { id, observacao } = corpo;
      const { error } = await admin
        .from("projetos")
        .update({ observacao: observacao ?? "" })
        .eq("id", id);
      if (error) throw error;
      revalidatePath("/admin/projetos");
      return NextResponse.json({ ok: true });
    }

    // ---- Apagar projeto ----
    if (acao === "apagar") {
      const { id } = corpo;
      const { error } = await admin.from("projetos").delete().eq("id", id);
      if (error) throw error;
      revalidatePath("/admin/projetos");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Ação desconhecida." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao processar." },
      { status: 500 }
    );
  }
}
