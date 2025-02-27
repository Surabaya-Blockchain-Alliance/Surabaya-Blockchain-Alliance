import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, provider, signInWithPopup } from '../config'; 
import Link from 'next/link';
import { FaGoogle, FaWallet } from 'react-icons/fa';
import LogoIcon from '@/components/LogoIcon';
import SocialIcon from '@/components/SocialIcon';

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
      const result = await signInWithPopup(auth, provider);  // Firebase Google sign-in

      const user = result.user;
      if (!user) {
        throw new Error('Failed to sign in with Google');
      }

      // Optionally, you can store user data in localStorage for persistent session
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to profile page after successful authentication
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
          className="grid grid-cols-2 justify-between items-center gap-10"
          style={{
            fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
            background: `url(${bgImage}) repeat 0 0`,
            animation: 'bg-scrolling-reverse 0.92s linear infinite',
          }}
        >
          <div className="h-screen bg-white w-full max-w-xl shrink-0 shadow-2xl items-center py-5 px-10">
            <div className="flex justify-between items-center">
              <LogoIcon />
              <div className="flex items-center gap-2">
                <p className="text-sm">First time on Cardano Hub Indonesia?</p>
                <Link href="/signup" className="bg-black rounded-full text-white px-3 py-1.5 text-xs">
                  <p>Create Account</p>
                </Link>
              </div>
            </div>
            <div className="pt-36 pb-5">
              <p className="text-lg font-bold">Signin on Cardano Hub Indonesia</p>
              <p className="text-sm font-medium">Welcome Back!</p>
            </div>
            <div className="py-1">
              <button
                className="btn w-full bg-white shadow-xl space-x-2 text-black hover:text-white hover:bg-black"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <FaGoogle /> {loading ? 'Signing In...' : 'Sign in with Google'}
              </button>
            </div>
            <div className="py-1">
              <button className="btn w-full bg-black shadow-xl space-x-2 text-white hover:bg-white hover:text-black">
                <FaWallet />Connect Wallet
              </button>
            </div>
            <footer className="footer bg-white text-black items-center sticky bottom-0 top-full">
              <aside className="grid-flow-col items-center">
                <LogoIcon size={24} />
                <p>Copyright © {currentYear} - All rights reserved</p>
              </aside>
              <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                <SocialIcon type="twitter" />
                <SocialIcon type="discord" />
                <SocialIcon type="telegram" />
              </nav>
            </footer>
          </div>
          <div className="py-2">
            <h1 className="text-4xl font-semibold">Cardano Hub Indonesia</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
