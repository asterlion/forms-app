import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import './i18n';

function App() {
    const [username, setUsername] = useState(localStorage.getItem('username') || '');

    const handleLogin = (username) => {
        setUsername(username);
        localStorage.setItem('username', username);
    };

    return (
        <Router>
            <div className="d-flex">
                <Sidebar />
                <div className="flex-grow-1 p-3">
                    <Routes>
                        <Route path="/" element={<h2>Home Page</h2>} />
                        <Route path="/profile" element={<Profile username={username} />} />
                        <Route path="/register" element={<Register onLogin={handleLogin} />} />
                        <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
