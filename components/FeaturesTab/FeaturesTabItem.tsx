import React from "react";
import { FeatureTab } from "@/types/featureTab";

const FeaturesTabItem = ({ featureTab }: { featureTab: FeatureTab }) => {
  const { title, desc1, desc2, videoUrl } = featureTab;

  // Convert standard YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="flex items-center w-full gap-8 lg:gap-19">
      <div className="md:w-1/2">
        <h2 className="text-3xl font-bold text-black mb-7 dark:text-white xl:text-sectiontitle2">
          {title}
        </h2>
        <p className="mb-5">{desc1}</p>
        <div className="flex items-center w-full">
          
        </div>
      </div>
      <div className="relative mx-auto hidden aspect-[16/9] max-w-[550px] md:block md:w-1/2 rounded-lg">
        <iframe
          width="560"
          height="315"
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
