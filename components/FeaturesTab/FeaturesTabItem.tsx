import React from "react";
import { FeatureTab } from "@/types/featureTab";
import Link from "next/link";

const FeaturesTabItem = ({ featureTab }: { featureTab: FeatureTab }) => {
  const { id, title, desc1, desc2, videoUrl } = featureTab;

  // Convert standard YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="flex items-center w-full gap-8 pb-10 lg:gap-19">
      <div className="space-y-1 md:w-1/2">
        <h2 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle2">
          {title}
        </h2>
        <p className="pb-5">{desc1}</p>
        <div className="flex items-center w-full">
          <Link href={`event/${id}`}>
            <button
              aria-label="get started button"
              className="flex rounded-full bg-black px-7.5 py-2.5 text-white duration-300 ease-in-out hover:bg-blackho dark:bg-btndark dark:hover:bg-blackho"
            >
              View More
            </button>
          </Link>
        </div>
      </div>
      <div className="relative mx-auto hidden aspect-[16/9] max-w-[550px] md:block md:w-1/2 rounded-lg">
        <iframe
          width="550"
          height="300"
          className="rounded-lg"
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default FeaturesTabItem;
