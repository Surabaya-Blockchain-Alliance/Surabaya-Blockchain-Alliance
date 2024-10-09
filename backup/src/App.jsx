// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuestPage from './pages/QuestPage'; // Adjust the path based on your structure
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quests" element={<QuestPage />} />
        </Routes>
    </Router>
  );
};

export default App;
