import React from "react";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";

const JoinCommunity: React.FC = () => {
    return (
        <div
            className="flex bg-white items-start justify-center">
            <div className="cursor-pointer w-screen pt-2 pb-10 overflow-hidden">
                <Link href="/community" className="card image-full h-60 rounded-4xl">
                    <img
                        src="https://t3.ftcdn.net/jpg/07/00/34/62/360_F_700346277_CecN7LvdCIRGdxjwahHa00gqRqAO6CcG.jpg"
                        alt="Shoes"
                        className="w-full h-full object-cover rounded-2xl"
                    />
                    <div className="p-10 w-full text-left z-50 space-y-2">
                        <span className="font-semibold text-4xl text-white break-words whitespace-nowrap">Community</span>
                        <p className="font-normal text-xl flex items-center break-words whitespace-nowrap justify-start gap-2 text-gray-200">
                            Join Our Community
                            <BsArrowRight />
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default JoinCommunity;