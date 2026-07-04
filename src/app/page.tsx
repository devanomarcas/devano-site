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
  {
    idx: "01",
    titulo: "Projetos de branding",
    texto: "Nossa metodologia completa, da pesquisa à implementação. Pesquisa e diagnóstico, estratégia e identidade, naming, identidade visual e plano de implementação. Para quem está construindo uma marca do zero ou reposicionando um negócio que já existe — e quer que cada decisão parta de um método, não de um palpite.",
    tag: "Metodologia completa",
  },
  {
    idx: "02",
    titulo: "Identidade visual",
    texto: "A construção do sistema visual da marca, para empresas que já têm maturidade em estratégia e um posicionamento bem definido. Conceito visual, logomarca e todo o sistema de aplicação — partindo de uma base estratégica que já está clara, traduzida em uma identidade coerente.",
    tag: "Para marcas com estratégia definida",
  },
  {
    idx: "03",
    titulo: "Estratégia de marca e estruturação de marketing",
    texto: "Consultoria que define a estratégia e o posicionamento da marca e ajuda o empresário a estruturar o melhor arranjo de marketing para a empresa: da definição de funções, pessoas, fluxos, processos e atividades até a decisão de contratar — internamente ou via terceiros. Para quem precisa não só de direção, mas de um marketing que funcione como estrutura.",
    tag: "Estratégia + estrutura de marketing",
  },
];

// TODO: feed do Instagram — preencher com as imagens dos posts/carrosséis.
// Cada item: { img: "/instagram/post1.jpg", link: "https://www.instagram.com/p/..." }
const instagram: { img: string; link: string }[] = [];

// Avaliações curadas do Google Meu Negócio (5 estrelas). A primeira aparece em destaque.
const avaliacoes = [
  {
    texto: "A Devano foi essencial para a nova era da Encaixe Móveis. Desde o início, mostraram uma escuta sensível e profunda, traduzindo tudo o que queríamos comunicar. O processo de rebranding foi conduzido com muito profissionalismo, sempre respeitando nossa essência e visão de futuro. O resultado foi uma identidade visual elegante e alinhada com o nosso propósito. Recomendo de olhos fechados para quem deseja um posicionamento de marca verdadeiro, estratégico e com impacto real.",
    nome: "Andréa Galvão",
    meta: "Encaixe Móveis · Local Guide",
    inicial: "A",
  },
  {
    texto: "A Devano é comprometida com o que se propõe e desenvolve um trabalho único em branding e soluções de estratégia.",
    nome: "Marcus Figueirêdo",
    meta: "Google · 6 avaliações",
    inicial: "M",
  },
  {
    texto: "Empresa de excelência! Entrega além do esperado. Já é o segundo projeto que desenvolvemos com a Devano e sempre nos surpreendemos com o nível de entrega.",
    nome: "Larissa Fernandes",
    meta: "Google",
    inicial: "L",
  },
  {
    texto: "Empresa super responsável e competente. Superou todas as expectativas no processo de branding!",
    nome: "Maria Beatriz",
    meta: "IDC",
    inicial: "M",
  },
  {
    texto: "Superou minhas expectativas!! Equipe altamente capacitada que resultou em um trabalho impecável!! Recomendo demais!",
    nome: "José Eduardo Correia",
    meta: "Google",
    inicial: "J",
  },
];

// Link do perfil no Google (substituir pelo link curto do Google Meu Negócio)
const googleReviewsUrl = "https://share.google/1u7FhEBZ7l681T6cw";

// TODO: portfólio — preencher com as 6 capas de projeto.
const projetos: { titulo: string; categoria: string; capa: string; link: string }[] = [];

export default function Home() {
  const posts = getAllPostsMeta().slice(0, 3);

  return (
    <>
      <Nav />
      <Reveal />

      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <p className="eyebrow reveal">Escritório de branding</p>
          <h1 className="reveal">Estruturamos negócios <em>a partir das marcas.</em></h1>
          <p className="sub reveal">
            Desenvolvemos estratégias de marca, marketing, design e comunicação para
            tornar a sua marca um ativo capaz de gerar valor para o cliente e para o
            negócio — e mais competitivo no mercado.
          </p>
          <div className="actions reveal">
            <Link href="/#contato" className="btn btn-primary">Iniciar uma conversa</Link>
            <Link href="/#servicos" className="btn btn-ghost">O que fazemos</Link>
          </div>
        </div>
        <Image className="spiral" src="/brand/espiral.png" alt="" width={280} height={430} aria-hidden />
      </header>

      {/* QUEM SOMOS */}
      <section id="somos" className="somos">
        <div className="wrap">
          <p className="label reveal">Quem somos</p>
          <p className="big reveal">
            Somos um escritório especializado em <strong>branding</strong>. Desenvolvemos
            estratégias de marca, marketing, design e comunicação{" "}
            <span className="muted">para tornar a sua marca um ativo capaz de proporcionar
            valor para o cliente e para o negócio, tornando-o ainda mais competitivo.</span>
          </p>
        </div>
      </section>

      {/* TRIANGULACAO */}
      <section id="metodo" className="alt">
        <div className="wrap">
          <div className="metodo-grid">
            <div>
              <p className="label reveal">Como pensamos</p>
              <h2 className="reveal">Toda marca nasce do encontro de três visões.</h2>
              <p className="lead reveal">
                Estratégia, mercado e repertório. Nenhuma marca se sustenta em uma só
                perspectiva — nosso trabalho começa onde as três se encontram.
              </p>
            </div>
            <div className="metodo-foto reveal">
              <Image src="/editorial/madeira.jpg" alt="" width={736} height={1272} aria-hidden />
            </div>
          </div>
          <div className="tri-grid reveal">
            {triangulacao.map((t) => (
              <div className="tri" key={t.n}>
                <div className="n">{t.n}</div>
                <h3>{t.titulo}</h3>
                <p>{t.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICOS */}
      <section id="servicos">
        <div className="wrap">
          <div className="servicos-head reveal">
            <div>
              <p className="label">O que fazemos</p>
              <h2>Três formas de trabalhar a sua marca.</h2>
            </div>
            <div className="tex">
              <Image src="/editorial/ladrilho.jpg" alt="" width={700} height={700} aria-hidden />
            </div>
          </div>
          <div className="servicos-list reveal">
            {servicos.map((s) => (
              <div className="servico" key={s.idx}>
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

      {/* BLOCO EDITORIAL — arcos */}
      <div className="editorial-block">
        <div className="wrap">
          <div className="quote-ed reveal">
            <p>A marca é a estrutura que sustenta tudo o que vem depois.</p>
            <span className="src">Devano · Escritório de branding</span>
          </div>
          <div className="ed-img reveal">
            <Image src="/editorial/arcos.jpg" alt="" width={1054} height={1546} aria-hidden />
          </div>
        </div>
      </div>

      {/* QUEM CONDUZ */}
      <section id="conduz" className="alt">
        <div className="wrap">
          <p className="label reveal">Quem conduz</p>
          <div className="conduz-grid reveal">
            <div className="conduz-foto">
              <Image src="/brand/lucas.jpg" alt="Lucas Mooneyhan" width={700} height={1050} />
              <div className="cap">
                <div className="nome">Lucas Mooneyhan</div>
                <div className="role">Fundador e diretor estratégico</div>
              </div>
            </div>
            <div className="conduz-texto">
              <h2>Direção sênior, dentro do projeto.</h2>
              <p className="lead">
                A Devano nasceu da prática de estruturar negócios a partir da marca. Esse
                processo virou método — fundamentado em pesquisa científica e empírica,
                em melhoria contínua.
              </p>
              <ul className="creds">
                <li><span>—</span> Lucas Mooneyhan, fundador e diretor estratégico</li>
                <li><span>—</span> Mestre em Ciência, Tecnologia e Inovação (UFRN)</li>
                <li><span>—</span> Pesquisador em gestão de marcas</li>
              </ul>
              <div className="hands-on">
                <h4>Senior Hands On</h4>
                <p>
                  Nossos diretores de nível sênior atuam diretamente nos projetos. Quem
                  conduz a estratégia é quem assina o resultado — não há repasse para
                  equipes júnior depois da reunião inicial.
                </p>
              </div>
            </div>
          </div>
          <div className="quote-block reveal">
            <p className="quote">
              Estruturar uma marca não é uma questão de gosto. É uma questão de método —
              e o método existe para que a decisão de hoje ainda faça sentido daqui a
              três anos.
              <span className="sig">Lucas Mooneyhan · Fundador</span>
            </p>
          </div>
        </div>
      </section>

      {/* AVALIAÇÕES */}
      <section id="avaliacoes">
        <div className="wrap">
          <div className="reviews-head">
            <div>
              <p className="label reveal">O que dizem nossos clientes</p>
              <h2 className="reveal">Confiança que se constrói projeto a projeto.</h2>
              <div className="reviews-rating reveal">
                <span className="stars">★★★★★</span>
                <span className="score"><strong>5,0</strong> no Google</span>
              </div>
            </div>
            <a className="google-link reveal" href={googleReviewsUrl} target="_blank" rel="noopener">
              Ver todas no Google ↗
            </a>
          </div>
          <div className="reviews-grid reveal">
            {avaliacoes.map((a, i) => (
              <div className="review" key={i}>
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
      <section id="trabalho" className="alt">
        <div className="wrap">
          <div className="ig-head">
            <div>
              <p className="label reveal">Nosso trabalho</p>
              <h2 className="reveal">O que temos construído.</h2>
            </div>
            <a className="ig-link reveal" href="https://www.instagram.com/devano.branding/" target="_blank" rel="noopener">
              @devano.branding ↗
            </a>
          </div>
          <div className="ig-grid reveal">
            {instagram.length > 0 ? (
              instagram.map((p, i) => (
                <a className="ig-cell" key={i} href={p.link} target="_blank" rel="noopener">
                  <Image src={p.img} alt="" width={300} height={300} />
                </a>
              ))
            ) : (
              <div className="ig-empty">
                Em breve — uma seleção dos nossos posts. Acompanhe em{" "}
                <a href="https://www.instagram.com/devano.branding/" target="_blank" rel="noopener" style={{ color: "var(--musgo)" }}>
                  @devano.branding
                </a>.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog">
        <div className="wrap">
          <p className="label reveal">Repertório</p>
          <h2 className="reveal">O pensamento por trás do método.</h2>
          <p className="lead reveal">
            Toda semana, uma reflexão sobre marca, estratégia, marketing e a construção
            de negócios.
          </p>
          <div className="posts reveal">
            {posts.map((post) => (
              <Link className="post" key={post.slug} href={`/blog/${post.slug}`}>
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

      {/* CTA */}
      <section id="contato" className="final">
        <div className="wrap">
          <h2 className="reveal">Sua marca sustenta a ambição do seu negócio?</h2>
          <p className="lead reveal">
            Se essa pergunta é difícil de responder, é um bom ponto de partida para
            conversarmos.
          </p>
          <a className="btn btn-primary reveal" href="https://wa.me/5584999951006?text=Ol%C3%A1%2C%20vim%20atrav%C3%A9s%20da%20landing%20page%20da%20Devano%2C%20gostaria%20de%20saber%20mais%20sobre%20suas%20solu%C3%A7%C3%B5es." target="_blank" rel="noopener">
            Iniciar uma conversa
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
