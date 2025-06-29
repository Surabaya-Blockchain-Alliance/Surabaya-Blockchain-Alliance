import React from "react";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";

const About: React.FC = () => {
    return (
        <section className="flex flex-col min-h-screen bg-white">
            <div className="flex-grow flex items-start justify-center">
                <div className="hero-content text-neutral-content py-10">
                    <div className="max-w-7xl space-y-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="space-y-3 text-left">
                                <Link className="bg-transparent animate-pulse rounded-full flex items-center justify-start gap-3 text-gray-600" href="">
                                    <span className={`font-semibold`}>What We Do</span>
                                    <BsArrowRight className="text-xs" />
                                </Link>
                                <h1 className="mb-5 text-5xl font-bold text-gray-900">
                                    Better Way to <span className="bg-gradient-to-br from-teal-100 via-cyan-400 to-sky-600 bg-clip-text text-transparent">Engage Customers</span>
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
            </div>
        </section>
    );
};

export default About;
