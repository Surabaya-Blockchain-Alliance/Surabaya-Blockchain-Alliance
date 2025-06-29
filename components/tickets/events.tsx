import Link from 'next/link';
import React from 'react';
import { FaCheckCircle, FaVideo } from 'react-icons/fa';

interface EventModalProps {
    id?: string;
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle: string;
    date: string;
    day: string;
    time: string;
    location: string;
    imageUrl: string;

    // Optional check-in props
    checkInStatus?: string;
    hasCheckedIn?: boolean;
    hasJoined?: boolean;
    walletAddress?: string | null;
    handleCheckIn?: () => void;
}

const EventModal: React.FC<EventModalProps> = ({
    id = 'event_modal',
    isOpen,
    onClose,
    title,
    subtitle,
    date,
    day,
    time,
    location,
    imageUrl,
    checkInStatus,
    hasCheckedIn = false,
    hasJoined = false,
    walletAddress = null,
    handleCheckIn,
}) => {
    return (
        <dialog id={id} className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box p-0 rounded-xl overflow-hidden shadow-lg max-w-3xl">
                {/* Top Ribbon */}
                <div className="bg-gradient-to-r from-violet-300 to-blue-300 px-6 py-2 relative">
                    <span
                        className={`absolute top-2 left-4 ${checkInStatus === "Y"
                            ? 'bg-green-700'
                            : 'bg-gray-600'
                            } text-white text-sm px-3 py-1 rounded-b-lg shadow`}
                    >
                        {checkInStatus === "Y" ? "Already Check In" : "Not Checked In"}
                    </span>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 p-6 bg-white">
                    {/* Left */}
                    <div className="flex flex-col justify-between py-4">
                        <div>
                            <h2 className="text-5xl font-extrabold text-indigo-800">{title}</h2>
                            <p className="uppercase font-semibold text-gray-500 mt-1">{subtitle}</p>
                        </div>

                        <div className="mt-6 border-t border-dashed pt-4 grid grid-cols-3 gap-4 text-sm text-gray-600">
                            {/* Date */}
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-indigo-500"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8 7V3M16 7V3M4 11h16M4 19h16M4 15h16M4 7h16"
                                    />
                                </svg>
                                <div>
                                    <div className="font-semibold">{date}</div>
                                    <div className="text-xs text-gray-500">{day}</div>
                                </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-center justify-center">
                                <span className="bg-indigo-600 text-white px-4 pt-1 rounded-full font-semibold">
                                    {time}
                                </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 justify-end text-right">
                                <FaVideo className="text-indigo-600 text-lg" />
                                <div className="pt-1">
                                    <Link
                                        target="_blank"
                                        href={location}
                                        className="font-semibold underline text-indigo-700"
                                    >
                                        URL Meet
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="hidden md:flex justify-center items-center bg-gradient-to-l from-white via-white to-transparent">
                        <img
                            src={imageUrl}
                            alt={title}
                            className="object-cover rounded-lg max-h-64"
                        />
                    </div>
                </div>

                {/* Check In Button */}
                {handleCheckIn && (
                    <button
                        onClick={handleCheckIn}
                        className="btn w-full bg-green-600 text-white hover:bg-green-700 shadow-xl rounded-xl p-0 flex items-center justify-center gap-2 mt-4"
                        disabled={hasCheckedIn || !hasJoined || !walletAddress}
                    >
                        <FaCheckCircle />
                        <span className='pt-1'>{hasCheckedIn ? 'Already Checked In' : `Check In ${title}`}</span>
                    </button>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-500 hover:text-black"
                >
                    ✕
                </button>
            </div>
        </dialog>
    );
};

export default EventModal;
