import React, { useState } from 'react';
import { Headings, IconScroll } from '../../components';
import { data } from '../../constants';
import './CaseStudies.css';
import { FiArrowUpRight } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

const CaseStudies = () => {
  const [hoveredVideo, setHoveredVideo] = useState(null);

  return (
    <div className="section-padding" id="use-cases">
      <Headings title="Upcoming Events" text="Join us for exciting events in the Cardano ecosystem! Explore, learn, and engage with blockchain enthusiasts and experts." />

      <Swiper
        spaceBetween={30}
        slidesPerView={3}
        navigation
        pagination={{ clickable: true }}
        className="event-slider"
      >
        {data.CaseStudies.map(({ text, link, image, video }, index) => (
          <SwiperSlide key={index} className="case-studies-item">
            <div 
              className="card" 
              onMouseEnter={() => setHoveredVideo(video)} 
              onMouseLeave={() => setHoveredVideo(null)}
            >
              <img src={image} alt={text} className="card-image" />
              <p>{text}</p>
              <a href={link} className="card-link">
                Read More <FiArrowUpRight />
              </a>
              {hoveredVideo === video && (
                <div className="video-overlay">
                  <iframe 
                    src={video} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen 
                  ></iframe>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <IconScroll />
    </div>
  );
}

export default CaseStudies;
