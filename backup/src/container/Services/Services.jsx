import React from 'react';
import { Headings } from '../../components';
import { data } from '../../constants';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import './Services.css';

const Services = () => {
  return (
    <div id="quests" className="d-block pt-md-4">
      <Headings title="Welcome to Cardano Hub Quests" />
      <p>
        Join us in our mission to enhance the Cardano blockchain ecosystem! Complete quests and tasks to earn rewards and contribute to the community. Your participation helps strengthen the network and promote decentralization.
      </p>
      <Swiper
        slidesPerView={2}
        spaceBetween={30}
        pagination={{ clickable: true }}
        navigation
        style={{ marginTop: '20px' }}
      >
        {data.ServicesData.map(({ titleone, titletwo, itemclass, imgURL, description }, index) => (
          <SwiperSlide key={index}>
            <div className={`card ${itemclass}`}>
              <div className="card-header d-flex align-items-center" style={{ backgroundColor: 'transparent' }}>
                <img 
                  src={imgURL} 
                  alt={titleone} 
                  className="img-fluid img-quests mr-3" 
                  style={{ maxWidth: '50px', marginRight: '15px', backgroundColor: 'transparent' }} 
                />
                <div style={{ backgroundColor: 'transparent' }}>
                  <span>{titleone}</span> <span>{titletwo}</span>
                </div>
              </div>
              <div className="card-body">
                <p>{description}</p>
                <button className="btn btn-primary">Start Quest</button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Services;
