import { createClient } from "@supabase/supabase-js";

// Cliente ADMIN — usa a chave secreta e só roda no servidor.
// A chave secreta NUNCA é exposta ao navegador; fica só nas rotas de API.
// Ela ignora as políticas de RLS, então usamos apenas para operações
// controladas pelo nosso próprio código (ex.: gravar um inscrito validado).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
