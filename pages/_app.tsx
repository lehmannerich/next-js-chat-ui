import "@/styles/globals.css";
import { Inter } from "@next/font/google";
import { Buffer } from "buffer";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps<{}>) {
  return (
    <>
      <Head>
        <title>Geschenkidee GPT</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎁</text></svg>"
        />
        <meta name="description" content={`AI-powered page writer for Geschenkidee.`} />
      </Head>
      <main className={inter.className}>
        <Component {...pageProps} />
        <Toaster position="bottom-right" />
      </main>
    </>
  );
}
