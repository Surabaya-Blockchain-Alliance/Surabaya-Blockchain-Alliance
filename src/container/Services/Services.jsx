import React, { useState } from 'react';
import { Headings } from '../../components';
import { data } from '../../constants';
import './Services.css';

const Services = () => {
  const [visibleIndex, setVisibleIndex] = useState(null);

  const toggleVisibility = (index) => {
    setVisibleIndex(visibleIndex === index ? null : index);
  };

  return (
    <div id="services" className="d-block pt-md-4">
      <Headings title="Welcome To Community Node," />
      <p>Your Trusted Partner in the POS Blockchain Ecosystem! We are deeply committed to the security, performance, and growth of the network. Our validator node is designed for delegators who seek not only to earn competitive staking rewards but also to contribute to the robustness and decentralization of the Blockchain ecosystem.</p>
      <div className="row">
      {data.ServicesData.map(({ titleone, titletwo, itemclass, imgURL, description }, index) => (
  <div className={`col-lg-6 col-12`} key={index}>
    <div className={`card ${itemclass}`} onClick={() => toggleVisibility(index)}>
      <div className="card-header d-flex align-items-center" style={{ backgroundColor: 'transparent' }}>
        <img src={imgURL} alt={titleone} className="img-fluid img-services mr-3" style={{ maxWidth: '50px', marginRight: '15px', backgroundColor: 'transparent' }} />
        <div style={{ backgroundColor: 'transparent' }}>
          <span>{titleone}</span> <span>{titletwo}</span>
        </div>
      </div>
      {visibleIndex === index && (
        <div className="card-body">
          <p>{description}</p> {/* Display the description here */}
        </div>
      )}
    </div>
  </div>
))}
      </div>
    </div>
  );
};

export default Services;
