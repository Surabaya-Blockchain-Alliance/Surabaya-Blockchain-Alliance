import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, provider } from '../config';
import { signInWithPopup } from 'firebase/auth';
import SocialIcon from "@/components/social-icon";
import Link from "next/link";
import { FaGoogle, FaWallet } from "react-icons/fa";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function SignUp() {
    const currentYear = new Date().getFullYear();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogleSignUp = async (): Promise<void> => {
        try {
            setLoading(true);
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            if (!user) {
                throw new Error('Failed to get user data');
            }
            console.log("Signed up user:", user);
            localStorage.setItem('user', JSON.stringify(user));
            router.push('/setup');
        } catch (error) {
            console.error('Error during Google sign-in:', error);
            alert('Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            @keyframes bg-scrolling-reverse {
                100% { background-position: -50px -50px; }
            }
        `;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    const bgImage =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

    return (
        <div className="min-h-screen">
            <div className="flex w-full min-h-screen text-gray-800 bg-white p-5">
                <div className="flex justify-between items-center w-full gap-20">
                    <div className="h-screen bg-white w-full max-w-xl shrink-0 items-center">
                        <div className="flex justify-between items-center">
                            <img src="/img/logo.png" alt="" className="h-full" width={130} />
                            <div className="flex items-center gap-2">
                                <p className="text-sm">Already have an account?</p>
                                <Link href={"/signin"} className="bg-black rounded-lg text-white px-3 py-1.5 text-xs">
                                    <p className="tex-xs">Join Now</p>
                                </Link>
                            </div>
                        </div>
                        <div className="pt-36 pb-5">
                            <p className="text-lg font-bold">Welcome Cardano Hub Indonesia</p>
                            <p className="text-sm font-medium">Create your account!</p>
                        </div>
                        <div className="py-1">
                            <button
                                className="btn w-full bg-white shadow-xl space-x-2 text-black hover:text-white hover:bg-black"
                                onClick={handleGoogleSignUp}
                                disabled={loading}
                            >
                                <FaGoogle /> {loading ? 'Signing Up...' : 'Sign up with Google'}
                            </button>
                        </div>
                        {/* <div className="py-1">
                            <button className="btn w-full bg-black shadow-xl space-x-2 text-white hover:bg-blue-700 hover:text-white">
                                <FaXTwitter /> Sign up with Twitter
                            </button>
                        </div> */}
                        <div className="py-1">
                            <button className="btn w-full bg-black shadow-xl space-x-2 text-white hover:bg-yellow-700 hover:text-white">
                                <FaWallet /> Connect Wallet
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
                    <div
                        className="hidden md:flex w-full bg-cover bg-center items-center h-screen justify-center text-white rounded-xl"
                        style={{ backgroundImage: "url('./img/bg-signup.avif')" }}
                    >
                        <div className="space-y-4 w-full px-10 text-end">
                            <p className="text-sm uppercase tracking-widest">- A Wise Quote -</p>
                            <h1 className="text-4xl font-bold leading-10">
                                Join the Movement
                            </h1>
                            <p className="text-lg font-semibold text-white/80">
                                Start your journey with us today!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
