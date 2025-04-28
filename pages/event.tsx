import { useEffect, useState } from 'react';
import LogoIcon from '@/components/LogoIcon';
import SocialIcon from '@/components/SocialIcon';
import EventCard from '@/components/card/events';

export default function EventPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Event 1: Blockchain Conference',
      description: 'Join us for a full day of blockchain talks and networking.',
      date: '2025-05-15',
      location: 'New York City, NY',
    },
    {
      id: 2,
      title: 'Event 2: Developer Meetup',
      description: 'A meetup for developers to share knowledge and collaborate.',
      date: '2025-06-10',
      location: 'San Francisco, CA',
    },
    {
      id: 3,
      title: 'Event 3: Cryptocurrency Workshop',
      description: 'Learn the basics of cryptocurrency and how to get started.',
      date: '2025-07-05',
      location: 'Online Event',
    },
  ]);

  useEffect(() => {
    setLoading(false); // Simulate data fetching complete
  }, []);

  const currentYear = new Date().getFullYear();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="w-full flex-1 overflow-y-auto">
        <div className="h-auto w-full bg-white shadow-xl p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
              {/* Display event cards in a grid layout, max 3 cards per row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer section */}
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
}
