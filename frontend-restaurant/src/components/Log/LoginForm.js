import React, { useContext, useState } from 'react';
import axios from 'axios'; 
import { useNavigate, Link } from 'react-router-dom';
import { authAPIs, BASE_URL, endpoints } from '../../configs/APIs'; 
import './Login.css';
import cookie from "react-cookies";
import { MyDispatchContext } from '../../App';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const dispatch = useContext(MyDispatchContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = new URLSearchParams();
    loginData.append('grant_type', 'password');
    loginData.append('client_id', 'X0krpG85JYNi3nnLzunU7699TRChJqhoU5phvqQ6'); 
    loginData.append('client_secret', '1uh5kSJIkjLZLu2gGhfzT6YhaFCfkAAT7yzHUiK90ayJC6DZeuGIYCTR5ejSkdtxXbOFM5ie2kGaD7nhfqfjj7ITsURXC1rZvehSFL58U7IDbhqsTVzKDDYyktEooRsP');
    loginData.append('username', username);
    loginData.append('password', password);

    try {
      const response = await axios.post(`${BASE_URL}${endpoints['login']}`, loginData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Save the access token in cookies
      cookie.save("token", response.data.access_token);

      // Fetch the current user after login using the token
      let userRes = await authAPIs().get(endpoints['currentUser']);
      console.info(userRes.data);

      // Save user data in cookies
      cookie.save("user", userRes.data);

      // Dispatch login action
      dispatch({
        type: "login",
        payload: userRes.data
      });

      // Redirect to home after successful login
      navigate("/");
      
    } catch (error) {
      if (error.response) {
        console.error('Response error data:', error.response.data);
        setMessage(`Đăng nhập thất bại: 'Kiểm tra lại thông tin'`);
      } else if (error.request) {
        console.error('No response from server:', error.request);
        setMessage('Không có phản hồi từ máy chủ. Vui lòng thử lại sau.');
      } else {
        console.error('Error:', error.message);
        setMessage(`Có lỗi xảy ra: ${error.message}`);
      }
    }
  };

  return (
    <div className="login-container" >
      <div className="login-box">
        <h2>Đăng Nhập</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button type="submit" className="login-button">Login</button>
        </form>

        {message && <p className="login-message">{message}</p>}

        <p className="register-link">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
      </div>
    </div>
  );
};

export default LoginForm;
