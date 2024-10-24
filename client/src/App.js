import './App.css';
import React, {useState} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import CreateFormPage from './components/CreateFormPage';
import PrivateRoute from './components/PrivateRoute';
import EditForm from './components/EditForm';
import './i18n';

function App() {
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const isAuthenticated = !!username;

    const handleLogin = (username) => {
        setUsername(username);
        localStorage.setItem('username', username);
    };

    const handleLogout = () => {
        setUsername('');
        localStorage.removeItem('username');
        localStorage.removeItem('token');
    };

    return (
        <Router>
            <div className="d-flex">
                <Sidebar isAuthenticated={isAuthenticated} username={username} onLogout={handleLogout}/>
                <div className="flex-grow-1 p-3">
                    <Routes>
                        <Route path="/" element={<Home isAuthenticated={isAuthenticated}/>}/>
                        <Route path="/profile" element={<Profile username={username}/>}/>
                        <Route path="/register" element={<Register onLogin={handleLogin}/>}/>
                        <Route path="/login" element={<Login onLogin={handleLogin}/>}/>
                        <Route element={<PrivateRoute isAuthenticated={isAuthenticated}/>}>
                            <Route path="/create-form" element={<CreateFormPage/>}/>
                            <Route path="/edit-form/:formId" element={<EditForm />} />
                        </Route>
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
