import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Register from './components/Register';
import Login from './components/Login';
import './i18n';

const Home = () => <h2>Home Page</h2>;
const Profile = () => <h2>Profile Page</h2>;

function App() {
  return (
      <Router>
          <div className="d-flex">
              <Sidebar />
              <div className="flex-grow-1 p-3">
                  <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/login" element={<Login />} />
                  </Routes>
              </div>
          </div>
      </Router>
  );
}

export default App;
