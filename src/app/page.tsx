import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Newsletter from "@/components/Newsletter";
import { getAllPostsMeta } from "@/lib/posts";

const triangulacao = [
  { n: "i", titulo: "A visão do fundador", texto: "A origem do negócio, suas motivações, desafios e a leitura inicial de diferencial. O ponto de partida que sustenta a identidade." },
  { n: "ii", titulo: "A visão da categoria", texto: "Comportamento de mercado, concorrência, tendências e a lógica de decisão do consumidor. A marca conectada ao ambiente competitivo real." },
  { n: "iii", titulo: "A visão estratégica", texto: "Repertório, método e análise transformam dados e percepções em direção clara. É o que organiza e traduz as outras duas visões." },
];

const servicos = [
  { idx: "01", titulo: "Projetos de branding", texto: "Nossa metodologia completa, da pesquisa à implementação. Pesquisa e diagnóstico, estratégia e identidade, naming, identidade visual e plano de implementação. Para quem está construindo uma marca do zero ou reposicionando um negócio que já existe, e quer que cada decisão parta de um método, não de um palpite.", tag: "Metodologia completa" },
  { idx: "02", titulo: "Identidade visual", texto: "A construção do sistema visual da marca, para empresas que já têm maturidade em estratégia e um posicionamento bem definido. Conceito visual, logomarca e todo o sistema de aplicação, partindo de uma base estratégica que já está clara, traduzida em uma identidade coerente.", tag: "Para marcas com estratégia definida" },
  { idx: "03", titulo: "Estratégia de marca e estruturação de marketing", texto: "Consultoria que define a estratégia e o posicionamento da marca e ajuda o empresário a estruturar o melhor arranjo de marketing para a empresa: da definição de funções, pessoas, fluxos, processos e atividades até a decisão de contratar, internamente ou via terceiros. Para quem precisa não só de direção, mas de um marketing que funcione como estrutura.", tag: "Estratégia + estrutura de marketing" },
];

const instagram: { img: string; link: string }[] = [];

const avaliacoes = [
  { texto: "A Devano foi essencial para a nova era da Encaixe Móveis. Desde o início, mostraram uma escuta sensível e profunda, traduzindo tudo o que queríamos comunicar. O processo de rebranding foi conduzido com muito profissionalismo, sempre respeitando nossa essência e visão de futuro. O resultado foi uma identidade visual elegante e alinhada com o nosso propósito. Recomendo de olhos fechados para quem deseja um posicionamento de marca verdadeiro, estratégico e com impacto real.", nome: "Andréa Galvão", meta: "Encaixe Móveis · Local Guide", inicial: "A" },
  { texto: "A Devano é comprometida com o que se propõe e desenvolve um trabalho único em branding e soluções de estratégia.", nome: "Marcus Figueirêdo", meta: "Google · 6 avaliações", inicial: "M" },
  { texto: "Empresa de excelência! Entrega além do esperado. Já é o segundo projeto que desenvolvemos com a Devano e sempre nos surpreendemos com o nível de entrega.", nome: "Larissa Fernandes", meta: "Google", inicial: "L" },
  { texto: "Empresa super responsável e competente. Superou todas as expectativas no processo de branding!", nome: "Maria Beatriz", meta: "IDC", inicial: "M" },
  { texto: "Superou minhas expectativas!! Equipe altamente capacitada que resultou em um trabalho impecável!! Recomendo demais!", nome: "José Eduardo Correia", meta: "Google", inicial: "J" },
];

const googleReviewsUrl = "https://share.google/1u7FhEBZ7l681T6cw";

export default async function Home() {
  const posts = (await getAllPostsMeta()).slice(0, 3);

  return (
    <>
      <Nav />
      <Reveal />

      {/* HERO — campo rifle com obra ao fundo, virada de galeria */}
      <header className="hero">
        <div className="hero-art parallax" data-speed="0.05" aria-hidden />
        <div className="hero-scrim" aria-hidden />
        <div className="wrap">
          <p className="micro g-rise">Escritório de branding · Natal/RN</p>
          <h1 className="g-rise" style={{ transitionDelay: ".1s" }}>
            Estruturamos negócios <span className="emph">a partir das marcas.</span>
          </h1>
          <p className="sub g-rise" style={{ transitionDelay: ".2s" }}>
            Estratégia, marketing e design para transformar a sua marca em um ativo.
          </p>
          <div className="actions g-rise" style={{ transitionDelay: ".3s" }}>
            <Link href="/#contato" className="btn btn-primary">Iniciar uma conversa</Link>
            <Link href="/#servicos" className="btn btn-ghost">O que fazemos</Link>
          </div>
        </div>
        <div className="scrollcue">Role para descobrir</div>
      </header>

      {/* SOMOS — palavra-display monumental (campo claro) */}
      <section id="somos" className="somos on-light">
        <div className="wrap">
          <p className="micro g-reveal">Quem somos</p>
          <p className="big g-reveal d1">
            Um escritório de <strong>branding</strong>.{" "}
            <span className="muted">Construímos marcas que viram ativo do negócio.</span>
          </p>
        </div>
      </section>

      {/* MÉTODO — campo ESCURO (verde) com obra + triangulação */}
      <section id="metodo" className="field-dark">
        <div className="wrap">
          <div className="metodo-grid">
            <div>
              <p className="micro g-reveal">Como pensamos</p>
              <h2 className="g-reveal d1">Toda marca nasce de três visões.</h2>
              <p className="lead g-reveal d2">
                Estratégia, mercado e repertório. Começamos onde as três se encontram.
              </p>
            </div>
            <div className="metodo-foto g-frame">
              <Image className="parallax" data-speed="0.08" src="/pinturas/obra-metodo.jpg" alt="" width={900} height={1200} />
            </div>
          </div>
          <div className="tri-grid">
            {triangulacao.map((t, i) => (
              <div className={`tri g-reveal d${i + 1}`} key={t.n}>
                <div className="tn">{t.n}</div>
                <h3>{t.titulo}</h3>
                <p>{t.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="on-light">
        <div className="wrap">
          <div className="servicos-head">
            <div>
              <p className="micro g-reveal">O que fazemos</p>
              <h2 className="g-reveal d1">Três formas de trabalhar a sua marca.</h2>
            </div>
            <div className="tex g-frame">
              <Image src="/pinturas/obra-servicos.jpg" alt="" width={1000} height={1000} />
            </div>
          </div>
          <div className="servicos-list">
            {servicos.map((s) => (
              <div className="servico g-reveal" key={s.idx}>
                <div className="idx">{s.idx}</div>
                <div>
                  <h3>{s.titulo}</h3>
                  <p>{s.texto}</p>
                  <span className="tag">{s.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITAÇÃO EDITORIAL — obra grande sangrando, campo rifle */}
      <div className="editorial-block">
        <div className="ed-inner">
          <div className="ed-quote g-reveal">
            <p>A marca é a estrutura que sustenta tudo o que vem depois.</p>
            <span className="src">Devano · Escritório de branding</span>
          </div>
          <div className="ed-figure g-frame">
            <Image className="parallax" data-speed="0.1" src="/pinturas/obra-editorial.jpg" alt="" width={900} height={1200} />
          </div>
        </div>
      </div>

      {/* QUEM CONDUZ — foto real do Lucas */}
      <section id="conduz" className="on-light">
        <div className="wrap">
          <p className="micro g-reveal">Quem conduz</p>
          <div className="conduz-grid">
            <div className="conduz-foto g-frame">
              <Image src="/brand/lucas.jpg" alt="Lucas Mooneyhan" width={700} height={1050} />
              <div className="cap">
                <div className="nome">Lucas Mooneyhan</div>
                <div className="role">Fundador e diretor estratégico</div>
              </div>
            </div>
            <div className="conduz-texto g-reveal d1">
              <h2>Direção sênior, dentro do projeto.</h2>
              <p className="lead">
                A Devano nasceu da prática de estruturar negócios a partir da marca. Esse
                processo virou método, fundamentado em pesquisa científica e empírica, em
                melhoria contínua.
              </p>
              <ul className="creds">
                <li>Lucas Mooneyhan, fundador e diretor estratégico</li>
                <li>Mestre em Ciência, Tecnologia e Inovação (UFRN)</li>
                <li>Pesquisador em gestão de marcas</li>
              </ul>
              <div className="hands-on">
                <h4>Senior Hands On</h4>
                <p>
                  Nossos diretores de nível sênior atuam diretamente nos projetos. Quem
                  conduz a estratégia é quem assina o resultado, sem repasse para equipes
                  júnior depois da reunião inicial.
                </p>
              </div>
            </div>
          </div>
          <div className="quote-block g-reveal">
            <p className="quote">
              Estruturar uma marca não é uma questão de gosto. É uma questão de método, e o
              método existe para que a decisão de hoje ainda faça sentido daqui a três anos.
              <span className="sig">Lucas Mooneyhan · Fundador</span>
            </p>
          </div>
        </div>
      </section>

      {/* AVALIAÇÕES — campo ESCURO (verde) */}
      <section id="avaliacoes" className="field-dark">
        <div className="wrap">
          <div className="reviews-head">
            <div>
              <p className="micro g-reveal">O que dizem os clientes</p>
              <h2 className="g-reveal d1">Confiança, projeto a projeto.</h2>
              <div className="reviews-rating g-reveal d2">
                <span className="stars">★★★★★</span>
                <span className="score"><strong>5,0</strong> no Google</span>
              </div>
            </div>
            <a className="google-link g-reveal" href={googleReviewsUrl} target="_blank" rel="noopener">
              Ver todas no Google ↗
            </a>
          </div>
          <div className="reviews-grid">
            {avaliacoes.map((a, i) => (
              <div className="review g-reveal" key={i}>
                <div className="stars">★★★★★</div>
                <p>{a.texto}</p>
                <div className="who">
                  <div className="avatar">{a.inicial}</div>
                  <div>
                    <div className="nome">{a.nome}</div>
                    <div className="meta">{a.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRABALHO / INSTAGRAM */}
      <section id="trabalho" className="on-light">
        <div className="wrap">
          <div className="ig-head">
            <div>
              <p className="micro g-reveal">Nosso trabalho</p>
              <h2 className="g-reveal d1">O que temos construído.</h2>
            </div>
            <a className="ig-link g-reveal" href="https://www.instagram.com/devano.branding/" target="_blank" rel="noopener">
              @devano.branding ↗
            </a>
          </div>
          <div className="ig-grid g-reveal">
            {instagram.length > 0 ? (
              instagram.map((p, i) => (
                <a className="ig-cell" key={i} href={p.link} target="_blank" rel="noopener">
                  <Image src={p.img} alt="" width={300} height={300} />
                </a>
              ))
            ) : (
              <div className="ig-empty">
                Em breve, uma seleção dos nossos posts. Acompanhe em{" "}
                <a href="https://www.instagram.com/devano.branding/" target="_blank" rel="noopener" style={{ color: "var(--telha)" }}>
                  @devano.branding
                </a>.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BLOG — campo ESCURO (verde) */}
      <section id="blog" className="field-dark">
        <div className="wrap">
          <p className="micro g-reveal">Repertório</p>
          <h2 className="g-reveal d1">O pensamento por trás do método.</h2>
          <p className="lead g-reveal d2">
            Toda semana, uma reflexão sobre marca e negócio.
          </p>
          <div className="posts">
            {posts.map((post, i) => (
              <Link className={`post g-reveal d${(i % 3) + 1}`} key={post.slug} href={`/blog/${post.slug}`}>
                <div className="thumb"><span>{post.pilar}</span></div>
                <div className="body">
                  <p className="date">{post.data}</p>
                  <h3>{post.titulo}</h3>
                  <p className="read">Ler o texto →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <Newsletter />

      {/* CTA — campo rifle */}
      <section id="contato" className="final">
        <div className="wrap">
          <h2 className="g-reveal">Sua marca sustenta a ambição do negócio?</h2>
          <p className="lead g-reveal d1">
            Se é difícil responder, já é um bom ponto de partida.
          </p>
          <a className="btn btn-primary g-reveal d2" href="https://wa.me/5584999951006?text=Ol%C3%A1%2C%20vim%20atrav%C3%A9s%20da%20landing%20page%20da%20Devano%2C%20gostaria%20de%20saber%20mais%20sobre%20suas%20solu%C3%A7%C3%B5es." target="_blank" rel="noopener">
            Iniciar uma conversa
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
