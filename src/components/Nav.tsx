"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={scrolled ? "scrolled" : ""}>
      <Link href="/" aria-label="Devano — início">
        <Image className="sym" src="/brand/espiral.png" alt="Devano" width={30} height={46} priority />
      </Link>
      <div className="navlinks">
        <Link href="/#somos">Quem somos</Link>
        <Link href="/#servicos">O que fazemos</Link>
        <Link href="/#conduz">Quem conduz</Link>
        <Link href="/#avaliacoes">Avaliações</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/#contato" className="navcta">Conversar</Link>
      </div>
    </nav>
  );
}
