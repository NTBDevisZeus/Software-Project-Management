import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import axios from "axios";
import './Product/ProductList.css'; // Assuming you have CSS for styling

const Home = () => {
  // const [products, setProducts] = useState([]); // State to store products
  // const [loading, setLoading] = useState(true); // State for loading spinner

  // // Fetch products from the API
  // const fetchProducts = async () => {
  //   try {
  //     const response = await axios.get('http://127.0.0.1:8000/products/');
  //     setProducts(response.data); // Update the products state
  //     setLoading(false); // Stop the loading spinner
  //   } catch (error) {
  //     console.error('Error fetching products:', error);
  //     setLoading(false); // Stop the spinner in case of error
  //   }
  // };

  // useEffect(() => {
  //   fetchProducts(); // Call the function when the component is mounted
  // }, []);

  // // Display a loading spinner if data is being fetched
  // if (loading) {
  //   return <Spinner animation="grow" variant="primary" />;
  // }

  return (

    <h1>chào mừng</h1>
  //   <div className="product-list-container">
  //     <h1 className="text-center text-primary mt-1">Danh Sách Món Ăn</h1>

  //     <div className="product-list">
  //       {products.map(product => (
  //         <div key={product.id} className="product-card">
  //           <img
  //             src={`http://res.cloudinary.com/dvxmxdhbj/${product.pr_image}`} // Image URL for Cloudinary
  //             alt={product.name}
  //             className="product-image"
  //           />
  //           <h3>{product.name}</h3>
  //           <p>{product.description}</p>
  //           <p>Giá: {product.price} VND</p>
  //           <p>Đánh giá: {product.rate} sao</p>
  //           <p>Số lượng: {product.quantity}</p>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  );
};

export default Home;
