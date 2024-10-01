import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="row">
        <div className="col-md-4 col-12">
          <ul className="info-contact">
            <li> <span>Contact us:</span></li>
            <li>Email: alfset5@gmail.com</li>
            <li>Telegram: @alfsst</li>
            <li>Address: Ngaglik Kuburan 19 </li>
            Surabaya, East Java, Indonesia.
          </ul>
        </div>

        <div className="rights">
          <p>© 2023 ComunityNode. All Rights Reserved.</p>

        </div>
      </div>
    </footer>
  )
}

export default Footer