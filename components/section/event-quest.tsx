import Link from "next/link";
import React, { useEffect, useState } from "react";
import Drawer from "../drawer/base";
import QuestCard from "../card/quest";
import EventCard from "../card/event";
import { useRouter } from "next/router";
import { Quest } from "@/types/quest"
import { Event } from "@/types/event"
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config";


const Quests: React.FC = () => {
    // Events Handle
    const [events, setEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [errorEvents, setErrorEvents] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "nft-images"));
                const eventsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Event[];
                setEvents(eventsData);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching events:", err);
                setError("Failed to load events.");
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleEventsClick = (id) => {
        router.push(`/join/event/${id}`);
    };

    // Quests Handle
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
      @keyframes bg-scrolling-reverse {
        100% { background-position: -50px -50px; }
      }
    `;
        document.head.appendChild(styleSheet);

        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    useEffect(() => {
        const fetchQuests = async () => {
            try {
                const questsSnapshot = await getDocs(collection(db, "quests"));
                const questsData = questsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Quest[];
                setQuests(questsData);
            } catch (err) {
                console.error("Error fetching quests:", err);
                setError("Failed to load quests.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuests();
    }, []);

    const drawerList = [
        {
            label: "Quest",
            content: <QuestCard quests={quests} />,
        },
        {
            label: "Events",
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-3 overflow-hidden w-full mx-auto">
                    {events.length ? (
                        events.map((event) => (
                            <EventCard
                                key={event.id}
                                title={event.title}
                                description={event.description}
                                time={event.time}
                                timezone={event.timezone}
                                joiners={"0"}
                                payment={"10 ₳"}
                                avatar={event.avatar}
                                onClick={() => handleEventsClick(event.id)}
                            />
                        ))
                    ) : (
                        <p className="text-center col-span-full text-gray-500">
                            No events available at the moment.
                        </p>
                    )}
                </div>
            ),
        }

    ];

    return (
        <div
            className="flex h-auto items-start justify-center" style={{
                backgroundImage: `url('./img/bg-events.png')`,
                backgroundSize: "cover",
            }}>
            <div className="hero-content text-neutral-content py-20">
                <div className="max-w-screen space-y-4">
                    <div className="space-y-1 text-center">
                        <Link className="bg-transparent animate-pulse rounded-full flex items-start justify-center gap-3 text-gray-900" href={""}>
                            <span className={`font-semibold`}>- Let's Completed Now! -</span>
                        </Link>
                        <p className="mb-1 text-5xl px-5 py-1 font-bold text-gray-900 break-words whitespace-normal">
                            Quests & <span className="bg-gradient-to-br from-sky-400 via-sky-400 to-sky-600 bg-clip-text text-transparent">Events</span>
                        </p>
                        <p className="text-black text-sm">Choose, complete quests & join the events you are interested in</p>
                    </div>
                    <div className="space-y-2 w-full flex justify-center items-start">
                        <Drawer
                            drawerItems={drawerList}
                            classParent='py-1 bg-white bg-opacity-50 rounded-full px-1.5'
                            title='Token Assets'
                            classActiveTab='pb-0 font-semibold rounded-full bg-white px-10 text-gray-700 pt-1.5'
                            classDeactiveTab='pb-0 pt-1.5 font-semibold rounded-full bg-transparent px-10 text-gray-500' align={"center"}                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Quests;