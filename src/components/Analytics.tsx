import Script from "next/script";

// Google Analytics 4
// Substitua "G-XXXXXXXXXX" pelo seu ID de medição (Measurement ID),
// que você obtém ao criar uma propriedade no Google Analytics.
const GA_ID = "G-5PV0MCRK1F";

export default function Analytics() {
  // Não carrega enquanto o ID for o placeholder
  if (!GA_ID || GA_ID === "G-5PV0MCRK1F") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
