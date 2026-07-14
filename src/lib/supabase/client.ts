import { createBrowserClient } from "@supabase/ssr";

// As chaves vêm das variáveis de ambiente (configuradas na Vercel e no .env.local).
// Você obtém esses valores no painel do Supabase, em Settings > API.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
