import React from 'react';
import { Headings } from '../../components';
import { data } from '../../constants';
import './Team.css'; 

const Team = () => {
  return (
    <div className="section-padding">
      <Headings title="Partnerships" text="Meet the skilled and experienced partners behind our Blockchain Journey" />

      <div className="row">
        {data.Partnership.map(({ name, position, info, foto }, index) => (
          <div className="col-lg-4 col-md-6 col-12" key={index}>
            <div className="card-team">
              <div className="card-team-header">
                <img src={foto} alt={name} />
                <p>
                  <span>{name}</span>
                  <br />
                  {position}
                </p>
              </div>
              <p>{info}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Team;
