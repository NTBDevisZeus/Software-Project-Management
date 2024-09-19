import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { BASE_URL, endpoints } from '../../configs/APIs';
import cookie from 'react-cookies';
import { MyCartContext } from '../../App';

const ProductDetail = () => {
  const { productId } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, dispatch] = useContext(MyCartContext);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`${BASE_URL}${endpoints['products']}/${productId}/`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  const addToCart = (p) => {
    let cart = cookie.load('cart') || {};
    if (p.id in cart) {
      cart[p.id]['quantity']++;
    } else {
      cart[p.id] = {
        id: p.id,
        name: p.name,
        unitPrice: p.price,
        quantity: 1,
      };
    }

    cookie.save('cart', cart);

    dispatch({ type: 'update' });
  };

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
            className="img-fluid rounded shadow"
          />
        </div>
        <div className="col-md-6">
          <h2 className="product-title mb-4">{product.name}</h2>
          <p className="product-description lead">{product.description}</p>
          <p><strong>Giá:</strong> {product.price} VND</p>
          <p><strong>Đánh giá:</strong> {product.rate} sao</p>
          <p><strong>Số lượng:</strong> {product.quantity}</p>

          {/* Nút thêm vào giỏ hàng */}
          <button
            className="btn btn-success btn-lg btn-block mt-3"
            onClick={() => addToCart(product)}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
