import React from "react";
import { BsCalendar } from "react-icons/bs";
import { FaCalendar, FaUser, FaUsers } from "react-icons/fa";
import { FaTicket } from "react-icons/fa6";

const eventList = [
    {
        title: "Introduction CoFinance [Received Grants from CrossFi]",
        description: "By Community Nodes",
        schedule: "26 Jan at 7.00 AM - 9 Feb at 8.00 AM",
        joiners: "20",
        payment: "Free",
        avatars: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    },
    {
        title: "Introduction CoFinance [Received Grants from CrossFi]",
        description: "By Community Nodes",
        schedule: "26 Jan at 7.00 AM - 9 Feb at 8.00 AM",
        joiners: "20",
        payment: "Free",
        avatars: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    }
];

const EventCard: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-4 p-3 overflow-hidden max-w-7xl">
            {eventList.map((event, index) => (
                <div
                    key={index}
                    className="shadow-lg bg-transparent border-1 rounded-lg border-black cursor-pointer hover:shadow-xl hover:scale-105 duration-300 ease-out transform transition-all"
                >
                    <figure className="p-2">
                        <img
                            src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                            alt="Shoes"
                            className="rounded-xl" />
                    </figure>
                    <p className="font-semibold text-black leading-none text-lg px-4 py-1">{event.title}</p>
                    <div className="space-y-2 p-4">
                        <div className="flex items-center justify-start space-x-2">
                            <div className="avatar">
                                <div className="w-4 rounded-full">
                                    <img src={event.avatars} alt="avatar" />
                                </div>
                            </div>
                            <span className="text-xs">{event.description}</span>
                        </div>
                        <div className="block space-y-2 py-2 text-gray-700">
                            <div className="flex justify-start items-center space-x-2">
                                <BsCalendar />
                                <span className="text-sm font-semibold">{event.schedule}</span>
                            </div>
                            <div className="flex justify-start items-start space-x-10">
                                <div className="flex justify-start items-center space-x-2">
                                    <FaUsers />
                                    <span className="text-sm font-semibold">{event.joiners} Going</span>
                                </div>
                                <div className="flex justify-start items-center space-x-2">
                                    <FaTicket />
                                    <span className="text-sm font-semibold">{event.payment}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EventCard;