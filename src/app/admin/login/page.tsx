import Image from "next/image";
import { login } from "../actions";

export const metadata = {
  title: "Entrar — Painel Devano",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const params = await searchParams;
  const temErro = params.erro === "1";

  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <Image
          src="/brand/logo-musgo.png"
          alt="Devano"
          width={140}
          height={30}
          className="admin-login-logo"
          priority
        />
        <p className="admin-login-sub">Painel de gestão</p>

        <form action={login} className="admin-login-form">
          <label>
            E-mail
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <label>
            Senha
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </label>
          {temErro && (
            <p className="admin-login-erro">
              E-mail ou senha incorretos. Tente novamente.
            </p>
          )}
          <button type="submit" className="btn btn-primary">
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
