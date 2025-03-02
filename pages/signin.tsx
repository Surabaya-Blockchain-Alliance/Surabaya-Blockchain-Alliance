import { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, provider, signInWithPopup } from '../config';
import Link from 'next/link';
import { FaGoogle, FaWallet } from 'react-icons/fa';
import LogoIcon from '@/components/LogoIcon';
import SocialIcon from '@/components/SocialIcon';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface User {
  email: string;
  displayName: string;
  photoURL: string;
  uid: string;
}

export default function SignIn(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Google Sign-in handler
  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);  

      const user = result.user;
      if (!user) {
        throw new Error('Failed to sign in with Google');
      }
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/setup');
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear: number = new Date().getFullYear();

  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = `
      @keyframes bg-scrolling-reverse {
        100% { background-position: 50px 50px; }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const bgImage: string =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC';

  return (
    <div className="min-h-screen">
      <div className="w-full h-screen text-gray-800">
        <div
          className="flex justify-between items-center gap-5"
          style={{
            fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
            background: `url(${bgImage}) repeat 0 0`,
            animation: 'bg-scrolling-reverse 0.92s linear infinite',
          }}
        >
          <div className="h-screen bg-white w-full max-w-xl shrink-0 shadow-2xl items-center py-5 px-10">
            <div className="flex justify-between items-center">
              <img src="/img/logo.png" alt="" className="h-full" width={130} />
              <div className="flex items-center gap-2">
                <p className="text-sm">First time on Cardano Hub Indonesia?</p>
                <Link href="/signup" className="bg-black rounded-lg text-white px-3 py-1.5 text-xs">
                  <p>Create Now</p>
                </Link>
              </div>
            </div>
            <div className="pt-36 pb-5">
              <p className="text-lg font-bold">Welcome to Cardano Hub Indonesia</p>
              <p className="text-sm font-medium">Start engage users and communities!</p>
            </div>
            <div className="py-1">
              <button
                className="btn w-full bg-white shadow-xl space-x-2 text-black hover:text-white hover:bg-black"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <FaGoogle /> {loading ? 'Please wait..' : 'Sign in with Google'}
              </button>
            </div>
            <div className="py-1">
              <button className="btn w-full bg-black shadow-xl space-x-2 text-white hover:bg-white hover:text-black">
                <FaWallet />Connect Wallet
              </button>
            </div>
            <footer className="footer bg-white text-black items-center sticky bottom-0 top-full">
              <aside className="grid-flow-col items-center">
                <img src="/img/emblem.png" alt="" className="h-full" width={46} />
                <p>Copyright © {currentYear} - All rights reserved</p>
              </aside>
              <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                <SocialIcon href={process.env.URL_TWITTER} type="twitter" />
                <SocialIcon href={process.env.URL_DISCORD} type="discord" />
                <SocialIcon href={process.env.URL_TELEGRAM} type="telegram" />
              </nav>
            </footer>
          </div>
          <div className="bg-transparent text-center p-48">
            <h1 className="text-4xl font-semibold">
              <span className='text-blue-800'>Cardano Hub</span> <span className='text-red-600'>Indonesia</span>
            </h1>
            <DotLottieReact
              src="https://lottie.host/300794aa-cd62-4cdf-89ac-3463b38d29a7/wVcfBSixSv.lottie"
              loop
              autoplay
            />
            <p className="text-lg font-medium">Start engage users and communities!</p>

          </div>
        </div>
      </div>
    </div>
  );
}
