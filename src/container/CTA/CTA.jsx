import React from 'react';
import './CTA.css';
import { images } from '../../constants';

const CTA = () => {
  return (
    <div className="section-padding">
      <div className="row cta">
        <div className="col-lg-8 col-12">
          <h3>Let’s Start Earning And Staked with us</h3>
          <p className="pt-2 pb-4">where your digital assets work for you. Dive into the future of finance by staking with us, and start earning passive income effortlessly. Our platform offers a seamless staking experience, designed for both beginners and seasoned investors looking to maximize their earnings.</p>
          <a href="/staking" className="btn-positivus">Start Staking</a>
        </div>
        <div className="col-lg-4 d-lg-flex d-none">
          <img src={images.thingshappen} alt="thingshappen" />
        </div>
      </div>
    </div>
  );
}

export default CTA;
