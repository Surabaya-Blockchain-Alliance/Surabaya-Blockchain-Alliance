import React from "react";
import Link from "next/link";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { Teko } from "next/font/google";
import InfinityBackground from "./animated/infinity";

const geistTeko = Teko({
    variable: "--font-geist-teko",
    subsets: ["latin"],
});

const Partnerships: React.FC = () => {
    return (
        <div
            className="flex h-96 bg-white items-center justify-center">
            <InfinityBackground />
            <div className="hero-content text-neutral-content py-1 px-10">
                <div className="max-w-7xl space-y-5">
                    <div className="block gap-3">
                        <div className="space-y-3 text-right">
                            <Link className="bg-transparent animate-pulse rounded-full flex items-center justify-end gap-3 text-gray-600" href={""}>
                                <BsArrowLeft className="text-xs" />
                                <span className={`font-semibold ${geistTeko.variable}`}>Our Partnerships</span>
                            </Link>
                            <h1 className="text-5xl font-bold">
                                <span className="text-gray-900"> Participate in the</span>
                               <span className="text-green-500"> Ownership Revolution</span>
                            </h1>
                        </div>
                        <div className="space-y-3 text-right pt-5">
                            <p className="mb-5 text-gray-700 font-semibold">
                                Meet the new standard for modern customer engagement. Drive growth and build loyalty with quests, sprints, and insights.
                            </p>
                            <Link className="btn bg-transparent font-bold border-2 rounded-full hover:text-white hover:border-white px-6 text-black" href={""}>
                                <BsArrowLeft className="text-xs" />
                                Join Now!
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Partnerships;