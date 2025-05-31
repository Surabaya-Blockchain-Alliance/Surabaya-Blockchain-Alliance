import React from "react";
import Link from "next/link";
import { Bs0CircleFill, BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { Teko } from "next/font/google";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const geistTeko = Teko({
    variable: "--font-geist-teko",
    subsets: ["latin"],
});

const About: React.FC = () => {
    return (
        <div
            className="flex h-auto bg-white items-start justify-center">
            <div className="hero-content text-neutral-content py-32">
                <div className="max-w-screen space-y-2">
                    <div className="flex items-center justify-between gap-10">
                        <div className="space-y-3 text-left">
                            <DotLottieReact
                                src="https://lottie.host/89b50d27-5c5d-4a02-a9db-9a27c70b1f02/dMVHCVr6S0.lottie"
                                loop
                                autoplay
                                style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}
                            />
                        </div>
                        <div className="space-y-3 text-right">
                            <Link className="bg-transparent animate-pulse rounded-full flex items-center justify-end gap-3 text-gray-600" href={""}>
                                <span className={`font-semibold ${geistTeko.variable}`}>- What We Do -</span>
                            </Link>
                            <h1 className="mb-5 text-5xl font-bold text-gray-900">
                                Better Way to <br /><span className="bg-gradient-to-br from-teal-100 via-cyan-400 to-sky-600 bg-clip-text text-transparent">Engage Customers</span>
                            </h1>
                            <div className="space-y-3">
                                <p className="mb-5 text-gray-700 font-semibold">
                                    Meet the new standard for modern customer engagement. <br />Drive growth and build loyalty with quests, sprints, and insights.
                                </p>
                                <Link className="btn bg-transparent py-1 border-black font-bold border-2 rounded-lg hover:text-white hover:border-white hover:bg-black px-6 text-black" href={"/quest"}>Learn More</Link>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default About;