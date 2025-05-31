import "@/styles/globals.css";
import type { AppProps } from "next/app";
import AOS from "aos";
import "aos/dist/aos.css"; 
import { useEffect } from "react";
import { Anek_Devanagari } from "next/font/google";

const anek = Anek_Devanagari({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <main className={anek.className}>
      <Component {...pageProps} />
    </main>
  );
}
