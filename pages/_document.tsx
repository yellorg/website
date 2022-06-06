import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
   return (
     <Html>
        <Head>
      <link rel="shortcut icon" href="/favicon.ico" />
        {/* <!-- Google Tag Manager --> */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-MKQHGKN');`}}></script>
        {/* <!-- End Google Tag Manager --> */}
   </Head>
        <body>
            {/* <!-- Google Tag Manager (noscript) --> */}
            <noscript dangerouslySetInnerHTML={{ __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MKQHGKN"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>`}}></noscript>
            {/* // <!-- End Google Tag Manager (noscript) --> */}
          <Main />
          <NextScript />
        </body>
     </Html>
  );
}
