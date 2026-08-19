import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ehGestor } from "@/lib/papel";

// TODAS as operações financeiras passam por aqui, e TODAS verificam
// se o usuário é gestor ANTES de qualquer leitura ou escrita.
// A equipe nunca recebe estes dados.

async function exigirGestor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, erro: "Não autorizado." };
  const gestor = await ehGestor(user.id);
  if (!gestor) return { ok: false as const, status: 403, erro: "Acesso restrito ao gestor." };
  return { ok: true as const, user };
}

// GET ?projeto_id=... → devolve o financeiro completo de um projeto (só gestor)
export async function GET(request: Request) {
  const guard = await exigirGestor();
  if (!guard.ok) return NextResponse.json({ error: guard.erro }, { status: guard.status });

  const { searchParams } = new URL(request.url);
  const projetoId = searchParams.get("projeto_id");
  if (!projetoId) return NextResponse.json({ error: "Falta projeto_id." }, { status: 400 });

  const admin = createAdminClient();
  const [fin, custos, parcelas] = await Promise.all([
    admin.from("financeiro").select("*").eq("projeto_id", projetoId).maybeSingle(),
    admin.from("custos").select("*").eq("projeto_id", projetoId),
    admin.from("parcelas").select("*").eq("projeto_id", projetoId).order("ordem", { ascending: true }),
  ]);

  return NextResponse.json({
    ok: true,
    total: fin.data?.valor_total ?? 0,
    custos: custos.data ?? [],
    parcelas: parcelas.data ?? [],
  });
}

// POST → salva o financeiro completo de um projeto (só gestor)
export async function POST(request: Request) {
  const guard = await exigirGestor();
  if (!guard.ok) return NextResponse.json({ error: guard.erro }, { status: guard.status });

  let corpo: any;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { projeto_id, total, custos, parcelas } = corpo;
  if (!projeto_id) return NextResponse.json({ error: "Falta projeto_id." }, { status: 400 });

  const admin = createAdminClient();

  try {
    // valor total (upsert)
    await admin
      .from("financeiro")
      .upsert({ projeto_id, valor_total: Number(total) || 0 }, { onConflict: "projeto_id" });

    // custos: apaga e regrava (simples e consistente)
    await admin.from("custos").delete().eq("projeto_id", projeto_id);
    if (Array.isArray(custos) && custos.length > 0) {
      await admin.from("custos").insert(
        custos.map((c: any) => ({
          projeto_id,
          funcao: c.funcao || "",
          valor: Number(c.valor) || 0,
        }))
      );
    }

    // parcelas: apaga e regrava
    await admin.from("parcelas").delete().eq("projeto_id", projeto_id);
    if (Array.isArray(parcelas) && parcelas.length > 0) {
      await admin.from("parcelas").insert(
        parcelas.map((p: any, i: number) => ({
          projeto_id,
          valor: Number(p.valor) || 0,
          vencimento: p.vencimento || null,
          recebida: !!p.recebida,
          ordem: i,
        }))
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erro ao salvar." }, { status: 500 });
  }
}
