import React from 'react';
import { IconScroll } from '../../components';
import Card from 'react-bootstrap/Card';
import './Hero.css';

const events = [
  {
    title: "Event 1",
    description: "Latest event on host 1",
    video: "https://www.youtube.com/embed/hzk8rS9lkDs",
    url: "https://www.youtube.com/watch?v=hzk8rS9lkDs",
    discoverUrl: "/event1", // Redirect URL for discover
  },
  {
    title: "Event 2",
    description: "Latest event on host 2",
    video: "https://www.youtube.com/embed/XGGWql33vA8",
    url: "https://www.youtube.com/watch?v=XGGWql33vA8",
    discoverUrl: "/event2", // Redirect URL for discover
  },
  {
    title: "Event 3",
    description: "Latest event on host 3",
    video: "https://www.youtube.com/embed/YOgbuAqGjVg",
    url: "https://www.youtube.com/watch?v=YOgbuAqGjVg",
    discoverUrl: "/event3", // Redirect URL for discover
  },
];

const Hero = () => {
  return (
    <div className="hero">
      <div className="row align-items-center">
        <div className="col-md-6 col-12">
          <h1 className="title fade-in">Learn and connect globally in Cardano with us</h1>
        </div>
      </div>

      <div className="supported-network-title">Latest Event</div>

      <div className="clients">
        <div className="running-cards">
          {events.map((event, index) => (
            <Card key={index} className="running-card">
              <Card.Body>
                {/* Display event title at the top */}
                <Card.Title>{event.title}</Card.Title>
                <Card.Text>{event.description}</Card.Text>
                <div className="video-container">
                  <iframe 
                    src={event.video} 
                    title={event.title} 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen 
                  />
                </div>
                {/* Discover link below the video */}
                <div className="discover-url">
                  <a href={event.discoverUrl} className="discover-link">
                    Discover
                  </a>
                </div>
                {/* Watch Event link below the discover link */}
                <div className="event-url">
                  <a href={event.url} target="_blank" rel="noopener noreferrer">
                    Watch Event
                  </a>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
      
      <IconScroll />
    </div>
  );
}

export default Hero;
