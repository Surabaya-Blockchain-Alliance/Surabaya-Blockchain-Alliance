import React from "react";
import { BsCalendar } from "react-icons/bs";
import { FaGift, FaUsers } from "react-icons/fa";
import { FaTicket } from "react-icons/fa6";

const questProjects = [
    {
        title: "Follow, Engage & Win up to 500 XFI",
        description: "By Community Nodes",
        prize: "500 XFI",
        rewards: "20",
        schedule: "26 Jan at 7.00 AM - 9 Feb at 8.00 AM",
        avatars: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        media: [
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        ]
    },
    {
        title: "Follow, Engage & Win up to 300 XFI",
        description: "By Admin Nodes",
        prize: "300 XFI",
        rewards: "20",
        schedule: "26 Jan at 7.00 AM - 9 Feb at 8.00 AM",
        avatars: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        media: [
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        ]
    },
];

const QuestCard: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-4 p-3 overflow-hidden max-w-7xl">
            {questProjects.map((quest, index) => (
                <div
                    key={index}
                    role="alert"
                    className="alert shadow-lg bg-transparent border-1 rounded-lg border-black cursor-pointer hover:shadow-xl hover:scale-105 duration-300 ease-out transform transition-all"
                >
                    <div className="space-y-2">
                        <p className="font-semibold text-black leading-none">{quest.title}</p>
                        <div className="flex items-center justify-start space-x-2">
                            <div className="avatar">
                                <div className="w-4 rounded-full">
                                    <img src={quest.avatars} alt="avatar" />
                                </div>
                            </div>
                            <span className="text-xs">{quest.description}</span>
                        </div>
                        <div className="flex items-center justify-start -space-x-2 py-2">
                            {quest.media.map((media, idx) => (
                                <div key={idx} className="avatar">
                                    <div className="w-6 rounded-full">
                                        <img src={media} alt="media" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="block space-y-2 py-2 text-gray-700">
                            <div className="flex justify-start items-center space-x-2">
                                <BsCalendar />
                                <span className="text-sm font-semibold">{quest.schedule}</span>
                            </div>
                            <div className="flex justify-start items-start space-x-10">
                                <div className="flex justify-start items-center space-x-2">
                                    <FaGift />
                                    <span className="text-sm font-semibold">{quest.rewards} Rewards</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="join">
                        <div className="indicator">
                            <span className="indicator-item badge text-white bg-black font-semibold">
                                {quest.prize}
                            </span>
                            <div className="avatar">
                                <div className="w-16 rounded-xl">
                                    <img src={quest.avatars} alt="avatar" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuestCard;
