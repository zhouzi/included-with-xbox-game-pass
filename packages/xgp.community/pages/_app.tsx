import * as React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import "../styles/globals.css";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>xgp.community</title>
        <meta name="title" property="og:title" content="xgp.community" />
        <meta
          name="description"
          property="og:description"
          content="Browser extension bringing the Xbox Game Pass to Steam."
        />
        <meta property="og:image" content="/images/storepage.png" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/modern-normalize@1.0.0/modern-normalize.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,300;0,600;1,800&display=swap"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default App;
