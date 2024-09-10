import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css'
const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatar, setAvatar] = useState(null); 
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);
    formData.append('phone_number', phoneNumber);
    if (avatar) {
      formData.append('avatar', avatar); 
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/users/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      });

      if (response.status === 201) {
        setMessage('Đăng ký thành công!');
        navigate('/'); // Chuyển về trang đăng nhập sau khi đăng ký thành công
      }
    } catch (error) {
      if (error.response) {
        setMessage(`Đăng ký thất bại: ${error.response.data.detail || 'Vui lòng kiểm tra lại thông tin.'}`);
        console.error('Registration failed:', error.response.data);
      } else {
        setMessage('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
        console.error('Registration failed:', error);
      }
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form" encType="multipart/form-data">
        <h2>Đăng Ký</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        {/* Thêm input để chọn file ảnh */}
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
        />
        <button type="submit" className="register-button">Register</button>
      </form>

      {message && <p className="register-message">{message}</p>}
    </div>
  );
};

export default RegisterForm;
