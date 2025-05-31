import React from "react";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import { Teko } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const geistTeko = Teko({
    variable: "--font-geist-teko",
    subsets: ["latin"],
});

const About: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-grow flex items-start justify-center">
                <div className="hero-content text-neutral-content py-10">
                    <div className="max-w-7xl space-y-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="space-y-3 text-left">
                                <Link className="bg-transparent animate-pulse rounded-full flex items-center justify-start gap-3 text-gray-600" href="">
                                    <span className={`font-semibold ${geistTeko.variable}`}>What We Do</span>
                                    <BsArrowRight className="text-xs" />
                                </Link>
                                <h1 className="mb-5 text-5xl font-bold text-gray-900">
                                    Better Way to Engage Customers
                                </h1>
                            </div>
                            <div className="space-y-3 text-left pt-20">
                                <p className="mb-5 text-gray-700 font-semibold">
                                    Meet the new standard for modern customer engagement. Drive growth and build loyalty with quests, sprints, and insights.
                                </p>
                                <Link className="btn bg-transparent font-bold border-2 rounded-full hover:text-white hover:border-white px-6 text-black" href="/create/event">
                                    Try it for free <BsArrowRight className="text-xs" />
                                </Link>
                            </div>
                        </div>
                        <div className="py-2">
                            <img src="/img/bg-about.svg" alt="" className="h-full" />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
