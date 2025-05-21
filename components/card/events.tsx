import React from "react";
import { BsCalendar } from "react-icons/bs";
import { FaUsers, FaTicket } from "react-icons/fa6";

interface EventCardProps {
  title: string;
  description: string;
  schedule: string;
  joiners?: string | number;
  payment?: string;
  avatar?: string;
  onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  description,
  schedule,
  joiners = "0",
  payment = "Free",
  avatar,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="shadow-lg bg-transparent border border-black rounded-lg cursor-pointer hover:shadow-xl hover:scale-105 duration-300 ease-out transform transition-all"
    >
      <figure className="p-2">
        <img
          src={avatar || "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"}
          alt={title}
          className="rounded-xl w-full object-cover"
          style={{ height: 180 }}
        />
      </figure>
      <p className="font-semibold text-black leading-none text-lg px-4 py-1">{title}</p>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-start space-x-2">
          <div className="avatar">
            <div className="w-6 rounded-full">
              <img src={avatar} alt="avatar" />
            </div>
          </div>
          <span className="text-xs">{description}</span>
        </div>
        <div className="block space-y-2 py-2 text-gray-700">
          <div className="flex justify-start items-center space-x-2">
            <BsCalendar />
            <span className="text-sm font-semibold">{schedule}</span>
          </div>
          <div className="flex justify-start items-start space-x-10">
            <div className="flex justify-start items-center space-x-2">
              <FaUsers />
              <span className="text-sm font-semibold">{joiners} Going</span>
            </div>
            <div className="flex justify-start items-center space-x-2">
              <FaTicket />
              <span className="text-sm font-semibold">{payment}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
