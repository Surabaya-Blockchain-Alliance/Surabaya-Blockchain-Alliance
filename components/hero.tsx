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
                    <div className="max-w-2xl space-y-5">
                        <Link className="bg-transparent animate-pulse rounded-full flex items-center justify-center gap-3 text-green-950" href={""} data-aos="fade-up">
                            <FaCircle className="text-xs" />
                            <span className="font-semibold">Join events, complete quests, and earn rewards while helping grow your favorite projects!</span>
                            <BsArrowRight className="text-xs" />
                        </Link>
                        <h1 className="mb-5 text-5xl font-bold text-gray-100" data-aos="fade-up">
                            A platform to engage users & communities to make projects more recognizable
                        </h1>
                        <p className="mb-5 text-gray-300 font-semibold" data-aos="fade-up">
                            Create quests that help grow your project while rewarding users for their contributions in a fun and interactive way
                        </p>
                        <Link data-aos="fade-up" className="btn bg-transparent border-white font-bold border-2 rounded-full hover:text-white hover:border-black px-6 text-white" href={"/Create/event"}>Start Creating Events <BsArrowRight className="text-xs" /></Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
