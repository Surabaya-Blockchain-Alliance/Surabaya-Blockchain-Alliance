import React, { useState, useEffect } from "react";
import LogoIcon from "@/components/LogoIcon";
import SocialIcon from "@/components/SocialIcon";
import QuestCard from "@/components/card/quests"; 

const QuestPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const currentYear = new Date().getFullYear();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
            <div className="space-y-3 text-left">
              <h3 className="text-xl font-semibold mb-4">Upcoming Quests</h3>
              <QuestCard />
            </div>

      {/* Footer Section */}
      <footer className="footer bg-white text-black items-center mt-6 p-4">
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
  );
};

export default QuestPage;
