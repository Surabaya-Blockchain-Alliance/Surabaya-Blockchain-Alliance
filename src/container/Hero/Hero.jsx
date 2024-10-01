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
          <h1 className="title fade-in">Learn and connect globally in Cardano with us</h1>
        </div>
      </div>

      {/* Adding the Supported Network Heading */}
      <div className="supported-network-title">Latest Event</div>

      <div className="clients">
        <div className="running-cards">
          {logos.map((logo, index) => (
            <Card key={index} className="running-card">
              <Card.Img variant="top" src={images[logo]} alt="logo" />
              <Card.Body>
                <Card.Title>{logo.replace("logo", "Logo ")}</Card.Title>
                <Card.Text>
                  Latest Event on host
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
          {logos.map((logo, index) => (
            <Card key={`duplicate-${index}`} className="running-card">
              <Card.Img variant="top" src={images[logo]} alt="logo" />
              <Card.Body>
                <Card.Title>{logo.replace("logo", "Logo ")}</Card.Title>
                <Card.Text>
                  This is a brief description of the logo.
                </Card.Text>
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
