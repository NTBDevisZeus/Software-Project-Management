import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductList.css';
import { BASE_URL, endpoints } from '../../configs/APIs';
import { useLocation, useNavigate } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const location = useLocation();  // Lấy thông tin URL để lấy từ khóa tìm kiếm
  const navigate = useNavigate();
  useEffect(() => {
    // Gọi API để lấy danh sách món ăn
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}${endpoints['products']}`);
        setProducts(response.data);

        const queryParams = new URLSearchParams(location.search);
        const searchTerm = queryParams.get('kw');

        if (searchTerm) {

          const filtered = response.data.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredProducts(filtered);
        } else {
          setFilteredProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [location.search]);

  return (
    <div className="product-list-container">
      <h2>Danh Sách Món Ăn</h2>
      <div className="product-list">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img
              src={`http://res.cloudinary.com/dvxmxdhbj/${product.pr_image}`}
              alt={product.name}
              className="product-image"
            />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Giá: {product.price} VND</p>
            <p>Đánh giá: {product.rate} sao</p>
            <p>Số lượng: {product.quantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
