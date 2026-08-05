import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 30;

const TAMANHO_MAX = 2 * 1024 * 1024; // 2 MB
const TIPOS_OK = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "capas";

export async function POST(request: Request) {
  // Só usuários logados podem subir
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let arquivo: File | null = null;
  try {
    const form = await request.formData();
    arquivo = form.get("arquivo") as File | null;
  } catch {
    return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  }

  if (!arquivo) {
    return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
  }
  if (!TIPOS_OK.includes(arquivo.type)) {
    return NextResponse.json(
      { error: "Formato inválido. Use JPG, PNG ou WEBP." },
      { status: 400 }
    );
  }
  if (arquivo.size > TAMANHO_MAX) {
    return NextResponse.json(
      { error: "Imagem muito grande. O limite é 2 MB." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Nome único para o arquivo
  const ext = arquivo.name.split(".").pop()?.toLowerCase() || "jpg";
  const nome = `capa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const bytes = new Uint8Array(await arquivo.arrayBuffer());

  const { error } = await admin.storage.from(BUCKET).upload(nome, bytes, {
    contentType: arquivo.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json(
      { error: `Não foi possível subir: ${error.message}` },
      { status: 500 }
    );
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(nome);

  return NextResponse.json({ ok: true, url: data.publicUrl });
}
