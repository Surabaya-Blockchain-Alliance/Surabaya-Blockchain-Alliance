import React, { useState } from 'react';
import { Headings } from '../components';
import './QuestPage.css';

const QuestPage = () => {
  const [address, setAddress] = useState('');
  const [quests, setQuests] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'user' && password === 'password') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (address) {
      const newQuest = {
        id: quests.length + 1,
        address: address,
        status: 'Pending',
      };
      setQuests([...quests, newQuest]);
      alert(`Address submitted: ${address}`);
      setAddress('');
    }
  };

  return (
    <div id="quests" className="d-block pt-md-4">
      <Headings title="Quest Hub" />
      
      {!isAuthenticated ? (
        <form onSubmit={handleLogin} className="mb-4">
          <h3>Login</h3>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      ) : (
        <>
          <p>
            Complete quests to earn rewards! Submit your address below.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Your Address</label>
              <input
                type="text"
                className="form-control"
                id="address"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-success">Submit Address</button>
          </form>

          {/* Display submitted quests */}
          <div className="mt-4">
            <h3>Your Quests</h3>
            {quests.length === 0 ? (
              <p>No quests submitted yet.</p>
            ) : (
              <ul className="list-group">
                {quests.map((quest) => (
                  <li key={quest.id} className="list-group-item">
                    Address: {quest.address} - Status: {quest.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestPage;
