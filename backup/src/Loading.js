// Loading.js
import React from 'react';
import './Loading.css'; // Ensure you have styles for your loading screen
import loadingGif from './assets/animate1.gif'; // Adjust the path based on where you store your assets

const Loading = () => (
    <div className="loading-container">
      {/* Display your loading GIF */}
      <img src={loadingGif} alt="Loading..." />
      {/* Add a text message below or above the GIF */}
      <h3>Please wait, Our site is under load.</h3>
    </div>
  );

export default Loading;
