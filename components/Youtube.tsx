"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaPlay, FaPlus, FaThumbsUp, FaVolumeUp } from "react-icons/fa";

interface Video {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
}

interface YoutubeCarouselProps {
    videos: Video[];
    onPlay: (videoId: string) => void;
    onSubs: (videoId: string) => void;
}

const YoutubeCarousel: React.FC<YoutubeCarouselProps> = ({ videos, onPlay, onSubs }) => {
    return (
        <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            loop
        >
            {videos.map((video) => (
                <SwiperSlide key={video.videoId}>
                    <div
                        className="relative h-[500px] md:h-[650px] text-white flex items-end p-8 rounded-xl"
                        style={{
                            backgroundImage: `url(${video.thumbnail})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        <div className="bg-gradient-to-t from-black via-transparent to-transparent absolute inset-0 rounded-2xl" />
                        <div className="relative z-10 w-full px-10 text-center">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">
                                {video.title}
                            </h2>
                            <p className="text-md md:text-lg mb-6 text-gray-300">
                                {video.description}
                            </p>
                            <div className="flex gap-4 justify-center pt-2 pb-4">
                                <button
                                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                                    onClick={() => onPlay(video.videoId)}
                                >
                                    <FaPlay /> <span className="pt-1">Play Now</span>
                                </button>
                                <button className="bg-white/20 hover:bg-white/30 p-4 rounded-full"
                                    onClick={() => onSubs(video.videoId)}>
                                    <FaThumbsUp />
                                </button>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default YoutubeCarousel;
