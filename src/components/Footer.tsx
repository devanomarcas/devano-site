import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="top">
          <div>
            <Image className="logo" src="/brand/logo-musgo.png" alt="Devano" width={180} height={39} />
            <p className="tag">Escritório especializado em branding. Estratégia, marketing, design e comunicação.</p>
          </div>
          <div className="cols">
            <div>
              <h5>Navegação</h5>
              <Link href="/#somos">Quem somos</Link>
              <Link href="/#servicos">O que fazemos</Link>
              <Link href="/#conduz">Quem conduz</Link>
              <Link href="/blog">Blog</Link>
            </div>
            <div>
              <h5>Contato</h5>
              <a href="https://wa.me/5584999951006?text=Ol%C3%A1%2C%20vim%20atrav%C3%A9s%20da%20landing%20page%20da%20Devano%2C%20gostaria%20de%20saber%20mais%20sobre%20suas%20solu%C3%A7%C3%B5es." target="_blank" rel="noopener">WhatsApp</a>
              <a href="https://www.instagram.com/devano.branding/" target="_blank" rel="noopener">Instagram</a>
              <a href="https://www.linkedin.com/company/devanomarcas/" target="_blank" rel="noopener">LinkedIn</a>
              <a href="mailto:falecomdevano@gmail.com">E-mail</a>
            </div>
          </div>
        </div>
        <div className="copy">
          <span>© {new Date().getFullYear()} Devano. Todos os direitos reservados.</span>
          <span>Natal · Brasil</span>
        </div>
      </div>
    </footer>
  );
}
