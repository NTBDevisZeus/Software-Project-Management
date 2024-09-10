import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = new URLSearchParams();
    loginData.append('grant_type', 'password');
    loginData.append('client_id', 'HxLMJrhwyV19DaOQ7AYNcZhu5YoEqWGFzikANw5N');
    loginData.append('client_secret', 'hdgFevbzsC0nbce7RkAEcMWOHEO7VmysHW5ox1D2qLVtpwfKnfdx0whSvAQuV8RlZ0mLoZBMWJgKFVz9uC68KgmloTM2cXHWqlySg17E2MFUjeq4lRGvTpYkczNE143T');
    loginData.append('username', username);
    loginData.append('password', password);

    try {
      const response = await axios.post('http://127.0.0.1:8000/o/token/', loginData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.access_token) {
        setMessage('Đăng nhập thành công!');
        localStorage.setItem('access_token', response.data.access_token);
        navigate('/home');
      }
    } catch (error) {
      setMessage('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Đăng nhập</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="login-button">Login</button>
      </form>

      {message && <p className="login-message">{message}</p>}

      {/* Thêm lựa chọn Đăng ký */}
      <p>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
    </div>
  );
};

export default LoginForm;
