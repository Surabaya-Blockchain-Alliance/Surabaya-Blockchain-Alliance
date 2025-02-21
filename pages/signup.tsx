import ButtonBase from "@/components/button/base";
import LogoIcon from "@/components/LogoIcon";
import SocialIcon from "@/components/SocialIcon";
import Link from "next/link";
import { useEffect } from "react";
import { FaGoogle, FaTwitter, FaWallet } from "react-icons/fa";

export default function SignUp() {
    const currentYear = new Date().getFullYear();

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
            <div
                className="w-full h-screen text-gray-800"
                style={{
                    fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
                    background: `url(${bgImage}) repeat 0 0`,
                    animation: "bg-scrolling-reverse 0.92s linear infinite",
                }}
            >
                <div className="grid grid-cols-2 justify-between items-center gap-10">
                    <div className="h-screen bg-white w-full max-w-xl shrink-0 shadow-2xl items-center py-5 px-10">
                        <div className="flex justify-between items-center">
                            <LogoIcon />
                            <div className="flex items-center gap-2">
                                <p className="text-sm">Already have an account?</p>
                                <Link href={"/signin"} className="bg-black rounded-full text-white px-3 py-1.5 text-xs">
                                    <p className="tex-xs">Login</p>
                                </Link>
                            </div>
                        </div>
                        <div className="pt-36 pb-5">
                            <p className="text-lg font-bold">Sign Up on Cardano Hub Indonesia</p>
                            <p className="text-sm font-medium">Create an Account</p>
                        </div>
                        <div className="py-1">
                            <button className="btn w-full bg-white shadow-xl space-x-2 text-black hover:text-white hover:bg-black">
                                <FaGoogle /> Sign up with Google
                            </button>
                        </div>
                        <div className="py-1">
                            <button className="btn w-full bg-blue-600 shadow-xl space-x-2 text-white hover:bg-blue-700 hover:text-white">
                                <FaTwitter /> Sign up with Twitter
                            </button>
                        </div>
                        <div className="py-1">
                            <button className="btn w-full bg-yellow-600 shadow-xl space-x-2 text-white hover:bg-yellow-700 hover:text-white">
                                <FaWallet /> Sign up with Wallet
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
