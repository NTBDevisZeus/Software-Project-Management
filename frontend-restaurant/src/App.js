import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/Log/LoginForm';
import Home from './components/Home';
import RegisterForm from './components/Log/RegisterForm'; 
import ProductList from './components/Product/ProductList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<RegisterForm />} /> 
        <Route path="/products" element={<ProductList />} />
        
      </Routes>
    </Router>
  );
}

export default App;
