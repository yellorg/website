import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html>
            <Head>
                <link rel="shortcut icon" href="/favicon.ico" />
                <script
                    async
                    src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
                />
                <script
                    dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
                            page_path: window.location.pathname,
                        });
                    `,
                    }}
                />
            </Head>
            <body className="no-scrollbar">
                {/* <!-- Google Tag Manager (noscript) --> */}
                <noscript dangerouslySetInnerHTML={{
                __html: `
                    <iframe
                    src="https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID}"
                    height="0"
                    width="0"
                    style="display:none;visibility:hidden"
                    ></iframe>
                `}}></noscript>
                {/* // <!-- End Google Tag Manager (noscript) --> */}
                <Main />
                <NextScript />
            </body>
        </Html>
  );
}
