import React from 'react'
import { Headings, IconScroll } from '../../components';
import { data } from '../../constants';
import './CaseStudies.css';
import { FiArrowUpRight } from 'react-icons/fi'


const CaseStudies = () => {
  return (
    <div className="section-padding" id="use-cases">

      <Headings title="Case Studies" text="Our validator that has been operating on the Planq Network for One years. Founded by a team of blockchain enthusiasts and Comunity Of Node Runner in Surabaya, We quickly established itself as a reliable validator thanks to its strong focus on security, community engagement, and performance" />

        <div className="case-studies">

          {data.CaseStudies.map(({ text, link }, index) => (
            <div key="index" className="case-studies-item">
              <p>{text}</p>
            </div>
          ))}
        </div>
        
    <IconScroll />
   
      </div>

  )
}

export default CaseStudies