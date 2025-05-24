import React from "react";
import { BsCalendar } from "react-icons/bs";
import { FaGift } from "react-icons/fa";
import Link from "next/link";

interface Quest {
  id: string;
  name: string;
  description: string;
  reward: number;
  rewardsCount: number;
  startDate: string;
  endDate: string;
  tokenPolicyId: string;
  tokenName: string;
  avatars?: string;
  media?: string[];
}

interface QuestCardProps {
  quests?: Quest[];
}

const QuestCard: React.FC<QuestCardProps> = ({ quests = [] }) => {
  if (!quests.length) {
    return (
      <div className="text-center p-6 text-gray-600">
        No quests available at the moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-3 overflow-hidden max-w-7xl mx-auto">
      {quests.map((quest) => (
        <Link key={quest.id} href={`/quest/${quest.id}/do`} passHref>
          <div
            role="alert"
            className="alert shadow-lg bg-transparent border border-black rounded-lg cursor-pointer hover:shadow-xl hover:scale-105 duration-300 ease-out transform transition-all"
            aria-label={`View quest: ${quest.name}`}
          >
            <div className="space-y-2 p-4">
              <p className="font-semibold text-black leading-none">{quest.name}</p>
              <div className="flex items-center justify-start space-x-2">
                <div className="avatar">
                  <div className="w-4 rounded-full">
                    <img
                      src={quest.avatars ?? "/img/logo.png"}
                      alt="Quest avatar"
                      onError={(e) => ((e.target as HTMLImageElement).src = "/img/logo.png")}
                    />
                  </div>
                </div>
                <span className="text-xs">{quest.description}</span>
              </div>
              <div className="flex items-center justify-start -space-x-2 py-2">
                {(quest.media ?? []).map((media, idx) => (
                  <div key={idx} className="avatar">
                    <div className="w-6 rounded-full">
                      <img src={media} alt={`Quest media ${idx + 1}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="block space-y-2 py-2 text-gray-700">
                <div className="flex justify-start items-center space-x-2">
                  <BsCalendar />
                  <span className="text-sm font-semibold">
                    {new Date(quest.startDate).toLocaleDateString()} -{" "}
                    {new Date(quest.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-start items-center space-x-2">
                  <FaGift />
                  <span className="text-sm font-semibold">
                    {quest.rewardsCount} Eligible Participants
                  </span>
                </div>
                <div className="flex justify-start items-center space-x-2">
                  <FaGift />
                  <span className="text-sm font-semibold">
                    {quest.reward} {quest.tokenName}
                  </span>
                </div>
              </div>
            </div>
            <div className="join">
              <div className="indicator">
                <span className="indicator-item badge text-white bg-black font-semibold">
                  {quest.reward} {quest.tokenName}
                </span>
                <div className="avatar">
                  <div className="w-16 rounded-xl">
                    <img
                      src={quest.avatars ?? "/img/logo.png"}
                      alt="Quest avatar"
                      onError={(e) => ((e.target as HTMLImageElement).src = "/img/logo.png")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuestCard;