import React from 'react';
import { Headings, IconScroll } from '../../components';
import { data } from '../../constants';
import './CaseStudies.css';
import { FiArrowUpRight } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

const CaseStudies = () => {
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
            <div className="card">
              <img src={image} alt={text} className="card-image" />
              <p>{text}</p>
              <div className="video-container">
                <iframe 
                  src={video} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                ></iframe>
              </div>
              <div className="discover-url">
                <a href={link} className="discover-link">
                  Read More <FiArrowUpRight />
                </a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <IconScroll />
    </div>
  );
}

export default CaseStudies;
