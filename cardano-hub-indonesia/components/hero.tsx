import React from "react";
import Link from "next/link";
import { FaCircle } from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";

const Hero: React.FC = () => {
    return (
        <div
            className="block min-h-screen"
            style={{
                backgroundImage: "url(/img/bg-hero.svg)",
                backgroundSize: "cover",
            }}>
            <div className="px-40 py-10 sticky">
                <div className="hero-content text-neutral-content text-center py-40">
                    <div className="max-w-xl space-y-5">
                        <Link className="bg-transparent animate-pulse rounded-full flex items-center justify-center gap-3 text-green-950" href={""} data-aos="fade-up">
                            <FaCircle className="text-xs" />
                            <span className="font-semibold">Let's join events, for completed your quests!</span>
                            <BsArrowRight className="text-xs" />
                        </Link>
                        <h1 className="mb-5 text-5xl font-bold text-gray-100" data-aos="fade-up">
                            The public blockchain for RWAfi
                        </h1>
                        <p className="mb-5 text-gray-300 font-semibold" data-aos="fade-up">
                            Tokenize real world assets, distribute them globally, and make them useful for native crypto users
                        </p>
                        <Link data-aos="fade-up" className="btn bg-transparent border-white font-bold border-2 rounded-full hover:text-white hover:border-black px-6 text-white" href={""}>Explore Quests <BsArrowRight className="text-xs" /></Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;