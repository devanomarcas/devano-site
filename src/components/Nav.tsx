import Image from "next/image";
import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <div className="wrap">
        <Link href="/">
          <Image className="logo" src="/brand/logo-musgo.png" alt="Devano" width={180} height={39} priority />
        </Link>
        <div className="navlinks">
          <Link href="/#somos">Quem somos</Link>
          <Link href="/#servicos">O que fazemos</Link>
          <Link href="/#conduz">Quem conduz</Link>
          <Link href="/#avaliacoes">Avaliações</Link>
          <Link href="/#trabalho">Trabalho</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/#contato" className="navcta">Conversar</Link>
        </div>
      </div>
    </nav>
  );
}
