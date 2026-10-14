import type { Metadata } from "next";
import Analytics from "@/components/Analytics";
import NewsletterPopup from "@/components/NewsletterPopup";
import "./globals.css";

const DESC =
  "Escritório especializado em branding. Desenvolvemos estratégias de marca, marketing, design e comunicação para tornar a sua marca um ativo competitivo. Projetos de branding, identidade visual e estruturação de estratégia e marketing.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.devanobranding.com"),
  title: {
    default: "Devano · Escritório de Branding | Estratégia, Marketing e Design",
    template: "%s · Devano",
  },
  description: DESC,
  keywords: [
    "branding", "escritório de branding", "estratégia de marca",
    "identidade visual", "posicionamento de marca", "naming",
    "estratégia de marketing", "design", "gestão de marcas",
    "consultoria de marca", "Natal", "Rio Grande do Norte",
  ],
  authors: [{ name: "Lucas Mooneyhan" }],
  creator: "Devano",
  publisher: "Devano",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Devano · Escritório de Branding",
    description: DESC,
    url: "https://www.devanobranding.com",
    siteName: "Devano",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devano · Escritório de Branding",
    description: DESC,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Devano",
  description: DESC,
  url: "https://www.devanobranding.com",
  founder: { "@type": "Person", name: "Lucas Mooneyhan", jobTitle: "Fundador e Diretor Estratégico" },
  areaServed: "BR",
  knowsAbout: ["Branding", "Estratégia de marca", "Identidade visual", "Marketing", "Design", "Posicionamento"],
  address: { "@type": "PostalAddress", addressLocality: "Natal", addressRegion: "RN", addressCountry: "BR" },
  sameAs: [
    "https://www.instagram.com/devano.branding/",
    "https://www.linkedin.com/company/devanomarcas/",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,300;0,400;0,500;1,300;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ ["--grain" as string]: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}>
        {children}
        <NewsletterPopup />
        <Analytics />
      </body>
    </html>
  );
}
