import React from 'react';
import { Headings } from '../../components';
import { data } from '../../constants';
import './Services.css';

const Services = () => {
  return (
    <div id="services" className="d-block pt-md-4">
      <Headings title="Welcome to Cardano Hub" />
      <p>
        We are a non-profit organization dedicated to supporting the Cardano blockchain ecosystem. Our mission is to ensure the security, performance, and growth of the network. We invite you to join us in contributing to the robustness and decentralization of the Cardano blockchain.
      </p>
      <div className="row">
        {data.ServicesData.map(({ titleone, titletwo, itemclass, imgURL, description }, index) => (
          <div className={`col-lg-6 col-12`} key={index}>
            <div className={`card ${itemclass}`}>
              <div className="card-header d-flex align-items-center" style={{ backgroundColor: 'transparent' }}>
                <img 
                  src={imgURL} 
                  alt={titleone} 
                  className="img-fluid img-services mr-3" 
                  style={{ maxWidth: '50px', marginRight: '15px', backgroundColor: 'transparent' }} 
                />
                <div style={{ backgroundColor: 'transparent' }}>
                  <span>{titleone}</span> <span>{titletwo}</span>
                </div>
              </div>
              <div className="card-body">
                <p>{description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
