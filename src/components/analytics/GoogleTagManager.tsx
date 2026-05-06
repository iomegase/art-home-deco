import Script from "next/script";

export function GoogleTagManager() {
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "true") {
    return null;
  }

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  if (!gtmId) {
    return null;
  }

  return (
    <>
      <Script
        id="gtm-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});`,
        }}
      />
      <Script id="gtm-script" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`} />
    </>
  );
}
