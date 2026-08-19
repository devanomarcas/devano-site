import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Verifica o papel do usuário logado consultando a tabela `perfis`.
 * Retorna 'gestor', 'equipe' ou null (se não tiver perfil).
 * A verificação é server-side: o resultado nunca depende do navegador.
 */
export async function getPapel(userId: string): Promise<"gestor" | "equipe" | null> {
  if (!userId) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("perfis")
    .select("papel")
    .eq("id", userId)
    .single();
  if (!data) return null;
  return data.papel === "gestor" ? "gestor" : "equipe";
}

export async function ehGestor(userId: string): Promise<boolean> {
  return (await getPapel(userId)) === "gestor";
}
