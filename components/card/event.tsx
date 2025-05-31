// components/card/event.tsx
import Link from "next/link";
import React from "react";

interface EventCardProps {
  time: string | number | Date;
  title: string;
  description: string;
  timezone?: string;
  schedule?: string;
  joiners?: string | number;
  payment?: string;
  avatar?: string;
  onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  time,
  title,
  description,
  timezone = "UTC",
  joiners = 0,
  payment = "Free",
  avatar,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="card text-black w-full shadow-sm p-3 bg-white rounded-lg cursor-pointer hover:shadow-xl hover:scale-105 duration-300 ease-out transform transition-all"
      aria-label={`View event: ${title}`}
    >
      <figure className="border rounded-lg max-h-48">
        <img
          src={avatar ?? "/img/logo.png"}
          alt="Event avatar"
          onError={(e) => ((e.target as HTMLImageElement).src = "/img/logo.png")}
        />
      </figure>
      <div className="p-3 w-full flex flex-col justify-center items-start space-y-4">
        <div className="space-y-1">
          <h2 className="card-title">
            {title}
            <div className="badge badge-outline pt-1 flex gap-2"> {payment}</div>
          </h2>
          <p>{description}</p>
        </div>

        <div className="stats bg-base-100 border-base-200 border w-full">
          <div className="stat">
            <div className="stat-title">Event Dates</div>
            <div className="stat-actions">
              <button className="btn btn-xs pt-1">
                {new Date(time).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: timezone,
                })}
              </button>
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Participants</div>
            <div className="stat-actions">
              <button className="btn btn-xs pt-1">{joiners} Join</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
