import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL, endpoints } from '../../configs/APIs';
import 'bootstrap/dist/css/bootstrap.min.css'; 

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const productResponse = await axios.get(`${BASE_URL}${endpoints['productcate'].replace('${categoryId}', categoryId)}`);
        setProducts(productResponse.data);

        const categoryResponse = await axios.get(`${BASE_URL}${endpoints['categories']}/${categoryId}/`);
        setCategory(categoryResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching products or category:', error);
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [categoryId]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Hàm gọi API đặt món khi ấn
  const handleOrderClick = async (productId) => {
    try {
      const orderResponse = await axios.post(`${BASE_URL}${endpoints['order']}`, {
        product_id: productId,
        quantity: 1,
      });

      if (orderResponse.status === 201) {
        alert('Đặt món thành công!');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Đặt món thất bại.');
    }
  };

  if (loading) {
    return <div className="text-center my-5"><p>Đang tải dữ liệu...</p></div>;
  }

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Danh sách món ăn thuộc danh mục {category ? category.name : ''}</h2>
      <div className="row">
        {products.length === 0 ? (
          <div className="col-12">
            <p className="text-center">Không có sản phẩm nào thuộc danh mục này.</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <img
                  src={`http://res.cloudinary.com/dvxmxdhbj/${product.pr_image}`}
                  alt={product.name}
                  className="card-img-top"
                  onClick={() => handleProductClick(product.id)}
                  style={{ cursor: 'pointer' }}
                />
                <div className="card-body">
                  <h5
                    className="card-title"
                    onClick={() => handleProductClick(product.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {product.name}
                  </h5>


<p className="card-text">{product.description}</p>
                  <p><strong>Giá:</strong> {product.price} VND</p>
                  <p><strong>Đánh giá:</strong> {product.rate} sao</p>
                  <p><strong>Số lượng:</strong> {product.quantity}</p>
                </div>
                <div className="card-footer">
                  <button
                    onClick={() => handleOrderClick(product.id)}
                    className="btn btn-success w-100"
                  >
                    Đặt món
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;