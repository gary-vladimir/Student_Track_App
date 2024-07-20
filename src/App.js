// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import CreateGroup from './components/CreateGroup';

const App = () => {
  return (
    <div className='bg-[#E7F9FA] p-36 min-h-screen'>
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/create-group" element={<CreateGroup />} />
        </Routes>
      </Router></div>
  );
};

export default App;
