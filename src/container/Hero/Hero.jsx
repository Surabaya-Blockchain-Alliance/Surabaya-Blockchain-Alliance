import React from 'react';
import { images } from '../../constants';
import { IconScroll } from '../../components';
import Card from 'react-bootstrap/Card';
import './Hero.css';

const logos = ["logo01", "logo02", "logo03", "logo04", "logo05", "logo06"];

const Hero = () => {
  const stats = {
    assetsStaked: '100,000 $',
    totalNodes: 6,
    totalDelegators: 150,
  };

  return (
    <div className="hero">
      <div className="row align-items-center">
        <div className="col-md-6 col-12">
          <h1 className="title fade-in">Learn and connect from gloablly in cardano with us</h1>
        </div>
      </div>

      {/* Adding the Supported Network Heading */}
      <div className="supported-network-title">Event</div>

      <div className="clients">
        <div className="running-logos">
          {logos.map((logo, index) => (
            <img key={index} src={images[logo]} alt="logo" />
          ))}
          {logos.map((logo, index) => (
            <img key={`duplicate-${index}`} src={images[logo]} alt="logo" />
          ))}
        </div>
      </div>
      
      <IconScroll />
    </div>
  );
}

export default Hero;
