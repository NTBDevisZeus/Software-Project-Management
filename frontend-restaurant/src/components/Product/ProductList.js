import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductList.css'; 

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Gọi API để lấy danh sách món ăn
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/products/');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

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
