import { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, provider, signInWithPopup } from '../config';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import WalletLogin from '../components/button/walletLogin';
import { FaGoogle } from 'react-icons/fa';
import SocialIcon from '@/components/social-icon';

interface User {
  email: string;
  displayName: string;
  photoURL: string;
  uid: string;
}

export default function SignIn(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const db = getFirestore();

  // Function to handle Google Sign-in
  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);

      const user = result.user;
      if (!user) {
        throw new Error('Failed to sign in with Google');
      }
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        localStorage.setItem('uid', user.uid);
        router.push('/profile');
      } else {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('uid', user.uid);
        router.push('/setup');
      }
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Wallet connection
  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const currentYear: number = new Date().getFullYear();

  useEffect(() => {
    const userUid = localStorage.getItem('uid');
    if (userUid) {
      router.push('/profile');
    }
    // Check if wallet address is available (i.e., connected) and redirect
    if (walletAddress) {
      router.push('/profile');
    }
  }, [walletAddress, router]);

  return (
    <div className="min-h-screen">
      <div className="flex w-full min-h-screen text-gray-800 bg-white p-5">
        <div className="flex justify-between items-center w-full gap-20">
          <div className="h-screen bg-white w-full max-w-xl shrink-0 items-center">
            <div className="flex justify-between items-center">
              <Link href={'/'}>
                <img src="/img/logo.png" alt="" className="h-full" width={130} />
              </Link>
              <div className="flex items-center gap-2">
                <p className="text-sm">First time on Cardano Hub Indonesia?</p>
                <Link href="/signup" className="bg-black rounded-lg text-white px-3 py-1.5 text-xs">
                  <p>Create Now</p>
                </Link>
              </div>
            </div>
            <div className="pt-36 pb-5">
              <p className="text-lg font-bold">Welcome to Cardano Hub Indonesia</p>
              <p className="text-sm font-medium">Start engaging users and communities!</p>
            </div>
            <div className="py-1">
              <button
                className="btn w-full bg-white shadow-xl space-x-2 text-black hover:text-white hover:bg-black"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <FaGoogle /> {loading ? <span className="loading loading-dots loading-md"></span> : 'Sign in with Google'}
              </button>
            </div>
            <div className="py-1">
              <WalletLogin
                onConnect={handleWalletConnect}
                onVerified={(address) => {
                  setWalletAddress(address);
                }}
              />
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
          <div
            className="hidden md:flex w-full bg-cover bg-center items-center h-screen justify-center text-white rounded-xl"
            style={{ backgroundImage: "url('./img/bg-signin.avif')" }}
          >
            <div className="space-y-4 w-full px-10 text-end">
              <p className="text-sm uppercase tracking-widest">- A Wise Quote -</p>
              <h1 className="text-4xl font-bold leading-10">
                Your journey continues here
              </h1>
              <p className="text-lg font-semibold text-white/80">
                Sign in to unlock new possibilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
