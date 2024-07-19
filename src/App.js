// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';

const App = () => {
  return (
    <div className='bg-[#E7F9FA] p-36 min-h-screen'>
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
        </Routes>
      </Router></div>
  );
};

export default App;
