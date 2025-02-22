import { useEffect, useState } from "react";
import LogoIcon from "@/components/LogoIcon";
import SocialIcon from "@/components/SocialIcon";
import Link from "next/link";
import EventCard from "@/components/card/events"; 

export default function ProfilePage() {
    const [userData, setUserData] = useState({
        username: "JohnDoe", 
        twitter: "john_doe_twitter",
        discord: "john_doe_discord",
        telegram: "john_doe_telegram",
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
        pointsCollected: 1200,
    });

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
      .sticky-card {
        position: sticky;
        top: 10px;
        max-height: 80vh;
        overflow-y: auto;
      }
    `;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="w-full h-screen text-gray-800">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left side - Profile information */}
                    <div className="h-screen bg-white w-full max-w-xl shrink-0 shadow-2xl py-5 px-10">
                        <div className="flex justify-between items-center">
                            <LogoIcon />
                            <Link href={"/"} className="text-sm text-black">Go to Dashboard</Link>
                        </div>

                        <div className="pt-16 pb-5">
                            <p className="text-2xl font-bold">Profile</p>
                            <p className="text-sm font-medium">Welcome back, {userData.username}!</p>
                            <div className="flex justify-between mt-2">
                                <p className="font-semibold">Points Collected:</p>
                                <p className="text-green-600">{userData.pointsCollected} Points</p>
                            </div>
                        </div>

                        <div className="py-4">
                            <div className="flex justify-between">
                                <p className="font-semibold">Twitter:</p>
                                <p className="text-blue-500">{userData.twitter}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="font-semibold">Discord:</p>
                                <p className="text-gray-700">{userData.discord}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="font-semibold">Telegram:</p>
                                <p className="text-gray-700">{userData.telegram}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="font-semibold">Wallet Address:</p>
                                <p className="text-gray-700">{userData.walletAddress}</p>
                            </div>
                        </div>

                        <footer className="footer bg-white text-black items-center sticky bottom-0 top-full mt-6">
                            <aside className="grid-flow-col items-center">
                                <LogoIcon size={24} />
                                <p>Copyright © {currentYear} - All rights reserved</p>
                            </aside>
                            <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                                <SocialIcon type="twitter" />
                                <SocialIcon type="discord" />
                                <SocialIcon type="telegram" />
                            </nav>
                        </footer>
                    </div>

                    {/* Right side - Event and Quest Cards */}
                    <div className="h-screen w-full bg-white shadow-xl p-6">
                        <div className="flex flex-col h-full space-y-6">
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                                <EventCard />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
