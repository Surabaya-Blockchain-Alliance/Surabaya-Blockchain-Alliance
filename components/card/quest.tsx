import React from "react";
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
  onClick?: () => void;
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-3 overflow-hidden w-full mx-auto">
      {quests.map((quest) => (
        <Link key={quest.id} href={`/quest/${quest.id}/do`} passHref>
          <div
            className="card shadow-lg p-3 bg-white border rounded-lg cursor-pointer hover:shadow-xl hover:scale-105 duration-300 ease-out transform transition-all"
            aria-label={`View quest: ${quest.name}`}
          >
            <div className="space-y-2 p-3 text-black">
              <div className="flex items-center justify-center space-x-3">
                <div className="avatar">
                  <div className="ring-gray-300 ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
                    <img
                      src={quest.avatars ?? "/img/logo.png"}
                      alt="Quest avatar"
                      onError={(e) => ((e.target as HTMLImageElement).src = "/img/logo.png")}
                    />
                  </div>
                </div>
                <div className="space-y-2 w-full">
                  <p className="font-semibold leading-none text-lg">{quest.name}</p>
                  <p className="text-xs break-words whitespace-normal">{quest.description}</p>
                </div>
              </div>

              <div className="flex justify-between w-full pt-5">
                <p className="font-semibold">🕘 {(() => {
                  const now = new Date();
                  const endDate = new Date(quest.endDate);
                  const timeDiff = endDate.getTime() - now.getTime();
                  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                  return daysLeft > 0 ? `${daysLeft} Days${daysLeft > 1 ? 's' : ''} Left` : `${daysLeft} Days${daysLeft > 1 ? 's' : ''} Left`;
                })()}</p>
                <p className="font-semibold">
                  🙋🏻‍♂️ {quest.rewardsCount ?? 0} Participants
                </p>

              </div>
              <div className="divider text-xs text-gray-50"></div>
              <div className="flex justify-center items-center gap-3">
                <div className="bg-black px-2 pt-3 pb-2 font-semibold w-36 rounded-lg text-white text-center">
                  <span>🎁</span> {quest.reward} {quest.tokenName}
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