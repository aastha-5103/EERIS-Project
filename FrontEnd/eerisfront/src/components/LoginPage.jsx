import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';
import NavBar from './NavBar';
import '../styles.css';
import WelcomeAnimate from './WelcomeAnimate'

const LoginPage = () => {
  const { setUser } = useUser(); // Get setUser from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Login failed');
      const userData = await res.json(); // Backend returns user details

      // Store the received user data in context
      setUser(userData); // Use the new setUser function
      if (userData.role === 'Manager') {
        handleNavigation('/approveTransactions');
      }else if (userData.role === 'HR') {
        handleNavigation('/hrpage');
      }else {
        handleNavigation('/home');
      }

    } catch (err) {
      console.error('Login failed:', err);
      alert('Invalid credentials. Please try again.');
    }
  };

  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      const navEvent = new CustomEvent('start-navigation', { detail: path });
      window.dispatchEvent(navEvent);
    }
  };

  return (
    <>
      <NavBar />
      <div className="login-container">
      <WelcomeAnimate />
        <form className="login-box" onSubmit={handleLogin}>
          <h2 style={{fontWeight:"300"}}>Log-in</h2>

          <input
            type="email"
            className='logInput'
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className='logInput'
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
};

export default LoginPage;