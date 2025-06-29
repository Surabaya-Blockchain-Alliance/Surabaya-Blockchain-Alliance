import "@/styles/globals.css";
import type { ReactElement, ReactNode } from "react";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Anek_Devanagari } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const anek = Anek_Devanagari({ subsets: ["latin"] });

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthPage, setIsAuthPage] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const authPages = ["/signin", "/signup", "/setup"];
    setIsAuthPage(authPages.includes(router.pathname));
  }, [router.pathname]);

  const getLayout = Component.getLayout ?? ((page) => (
    <main className={anek.className}>
      {!isAuthPage && (
        <div className="sticky top-0 z-50 transition-all">
          <div className={`px-6 md:px-20 lg:px-40 ${isScrolled ? "py-4 bg-transparent" : "py-4 bg-white"}`}>
            <Navbar />
          </div>
        </div>
      )}
      <div className="bg-gray-50 bg-opacity-50">{page}</div>
      {!isAuthPage && <Footer />}
    </main>
  ));

  return getLayout(<Component {...pageProps} />);
}
