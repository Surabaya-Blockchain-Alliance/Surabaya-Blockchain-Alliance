import React, { useEffect, useState } from "react";
import { useRouter } from "next/router"; 
import { BsCalendar } from "react-icons/bs";
import { FaGift } from "react-icons/fa";

const EventDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; 

  const [quest, setQuest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchQuestDetail = async () => {
        try {
          const response = await fetch("/data/events.json"); // Fetch quest data from the mock file
          const data = await response.json();
          const foundQuest = data.find((quest: any) => quest.id === id); // Find quest by ID
          setQuest(foundQuest);
        } catch (error) {
          console.error("Error fetching quest:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchQuestDetail();
    }
  }, [id]); 

  if (loading) {
    return <div>Loading quest details...</div>;
  }

  if (!quest) {
    return <div>Quest not found!</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">{quest.title}</h1>
      <div className="flex gap-4 mt-4">
        <img src={quest.avatars} alt="Quest Avatar" className="w-32 h-32 rounded-full" />
        <div>
          <p><strong>Description:</strong> {quest.description}</p>
          <p><BsCalendar /> <strong>Schedule:</strong> {quest.schedule}</p>
          <p><FaGift /> <strong>Rewards:</strong> {quest.rewards} Rewards</p>
          <p><strong>Prize:</strong> {quest.prize}</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold">Media</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {quest.media.map((media: string, index: number) => (
            <div key={index} className="w-full h-40 bg-gray-200 rounded-md">
              <img src={media} alt={`media-${index}`} className="w-full h-full object-cover rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
