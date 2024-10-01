import React from 'react';
import { Headings, IconScroll } from '../../components';
import { data } from '../../constants';
import './CaseStudies.css';
import { FiArrowUpRight } from 'react-icons/fi';

const CaseStudies = () => {
  return (
    <div className="section-padding" id="use-cases">
      <Headings title="Case Studies" text="Our validator that has been operating on the Planq Network for One year. Founded by a team of blockchain enthusiasts and the Community of Node Runners in Surabaya, we quickly established ourselves as a reliable validator thanks to our strong focus on security, community engagement, and performance." />

      <div className="case-studies">
        {data.CaseStudies.map(({ text, link }, index) => (
          <div key={index} className="case-studies-item">
            <div className="card">
              <p>{text}</p>
              <a href={link} className="card-link">
                Read More <FiArrowUpRight />
              </a>
            </div>
          </div>
        ))}
      </div>

      <IconScroll />
    </div>
  );
}

export default CaseStudies;
