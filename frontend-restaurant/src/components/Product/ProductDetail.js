import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { BASE_URL, endpoints } from '../../configs/APIs';



const ProductDetail = () => {
  const { productId } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`${BASE_URL}${endpoints['products']}/${productId}/`);
        console.log(response.data);
        setProduct(response.data);
       
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);
    //hàm gọi khi nhắn đặt món


  if (loading) {
    return <div className="text-center my-5"><p>Đang tải chi tiết sản phẩm...</p></div>;
  }

  if (!product) {
    return <div className="text-center my-5"><p>Không tìm thấy sản phẩm.</p></div>;
  }



  
  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-6">
          <img
            src={`http://res.cloudinary.com/dvxmxdhbj/${product.pr_image}`}
            alt={product.name}
            className="img-fluid rounded"
          />
        </div>
        <div className="col-md-6">
          <h2 className="mb-4">{product.name}</h2>
          <p className="lead">{product.description}</p>
          <p><strong>Giá:</strong> {product.price} VND</p>
          <p><strong>Đánh giá:</strong> {product.rate} sao</p>
          <p><strong>Số lượng:</strong> {product.quantity}</p>

          {/* Nút đặt món */}
          <button  className="btn btn-success btn-lg" >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

