import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; 
import StakingPage from './pages/StakingPage'; 
import { SpeedInsights } from "@vercel/speed-insights/react"


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/staking" element={<StakingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
