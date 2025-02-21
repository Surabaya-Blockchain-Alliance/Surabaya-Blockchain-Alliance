import Link from "next/link";
import React from "react";
import { BsArrowRight } from "react-icons/bs";
import Drawer from "./drawer/base";
import QuestCard from "./card/quests";
import EventCard from "./card/events";

const Quests: React.FC = () => {

    const drawerList = [
        {
            label: "Quest",
            content: <QuestCard />,
        },
        {
            label: "Events",
            content: <EventCard />,
        },
    ];

    return (
        <div
            className="flex min-h-screen bg-white items-start justify-center">
            <div className="hero-content text-neutral-content pt-10">
                <div className="max-w-7xl space-y-5">
                    <div className="flex items-start justify-between gap-5">
                        <div className="space-y-3 text-left max-w-96">
                            <div className="pt-0">
                                <Link className="bg-transparent animate-pulse rounded-full flex items-center justify-start gap-3 text-gray-900" href={""}>
                                    <span className={`font-semibold`}>Let's Completed Now!</span>
                                    <BsArrowRight className="text-xs" />
                                </Link>
                            </div>
                            <div className="py-6">
                                <div className="bg-gradient-to-br from-neutral-50 via-amber-200 to-sky-900 rounded-xl">
                                    <p className="mb-1 text-5xl px-5 py-5 font-bold text-gray-900 break-words whitespace-normal">
                                        Quests & Events
                                    </p>
                                    <div className="cursor-pointer hover:scale-105 duration-300 ease-out transform transition-all p-3 overflow-hidden">
                                        <Link href="/community" className="card image-full h-48 rounded-2xl">
                                            <img
                                                src="https://t3.ftcdn.net/jpg/07/00/34/62/360_F_700346277_CecN7LvdCIRGdxjwahHa00gqRqAO6CcG.jpg"
                                                alt="Shoes"
                                                className="w-full h-full object-cover rounded-2xl"
                                            />
                                            <div className="p-6 w-32 text-left z-50">
                                                <span className="font-semibold text-xl text-white break-words whitespace-nowrap">Wan't to find another quest?</span>
                                                <p className="font-normal text-sm flex items-center break-words whitespace-nowrap justify-start gap-2 text-gray-200">
                                                    Visit more
                                                    <BsArrowRight />
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 text-left">
                            <Drawer
                                drawerItems={drawerList}
                                classParent='py-2'
                                title='Token Assets'
                                classActiveTab='py-2 font-semibold rounded-full bg-black px-10 text-white'
                                classDeactiveTab='py-2 font-semibold rounded-full bg-transparent border-2 border-black px-10 text-black'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Quests;