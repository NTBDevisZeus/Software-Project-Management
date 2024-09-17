import { useContext, useEffect, useState } from "react";
import { Spinner, Container, Row, Col, Card, Button } from "react-bootstrap";
import APIs, { endpoints } from "../configs/APIs";
import cookie from 'react-cookies';
import { MyCartContext } from "../App";
import './Style/home.css'; // Import file CSS tuỳ chỉnh
import { useLocation, useNavigate } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]); // State để lưu tất cả sản phẩm
  const [filteredProducts, setFilteredProducts] = useState([]); // State để lưu sản phẩm sau khi lọc
  const [loading, setLoading] = useState(true); // State để quản lý trạng thái loading
  const [, dispatch] = useContext(MyCartContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm tải sản phẩm từ API
  const loadProducts = async () => {
    try {
      let res = await APIs.get(endpoints['products']);
      setProducts(res.data); // Lưu tất cả sản phẩm
      setFilteredProducts(res.data); // Ban đầu hiển thị tất cả sản phẩm
      setLoading(false); // Dừng trạng thái loading
    } catch (error) {
      console.error("Error fetching products: ", error);
      setLoading(false); // Dừng trạng thái loading nếu có lỗi
    }
  };

  // Sử dụng effect để tải sản phẩm và lắng nghe sự thay đổi của từ khóa tìm kiếm
  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('kw'); // Lấy từ khóa tìm kiếm từ URL

    if (searchTerm) {
      // Lọc sản phẩm dựa trên từ khóa tìm kiếm
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered); // Lưu sản phẩm đã lọc
    } else {
      setFilteredProducts(products); // Hiển thị tất cả sản phẩm nếu không có từ khóa
    }
  }, [location.search, products]); // Lắng nghe sự thay đổi của location.search hoặc products

  const addToCart = (p) => {
    let cart = cookie.load("cart") || null;
    if (cart === null)
      cart = {};

    if (p.id in cart) {
      cart[p.id]["quantity"]++;
    } else {
      cart[p.id] = {
        "id": p.id,
        "name": p.name,
        "unitPrice": p.price,
        "quantity": 1
      };
    }

    cookie.save("cart", cart);

    dispatch({
      "type": "update"
    });
  };

  const handleViewDetail = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Hiển thị loading spinner nếu dữ liệu đang được tải
  if (loading) {
    return <Spinner animation="grow" variant="primary" />;
  }

  return (
    <Container className="mt-4">
      <h1 className="text-center text-primary mb-4">Danh Sách Sản phẩm</h1>
      <Row>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Col key={product.id} md={4} lg={3} className="mb-4">
              <Card className="h-100 product-card">
                <Card.Img variant="top" src={`http://res.cloudinary.com/dvxmxdhbj/${product.pr_image}`} alt={product.name} />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>{product.description}</Card.Text>
                  <Card.Text>Giá: {product.price} VND</Card.Text>
                  <Card.Text>Đánh giá: {product.rate} sao</Card.Text>
                  <Card.Text>Số lượng: {product.quantity}</Card.Text>

                  <div className="button-group">
                    <Button variant="primary" className="btn-add-cart" onClick={() => addToCart(product)}>
                      Thêm vào giỏ hàng
                    </Button>
                    <Button variant="outline-primary" className="btn-view-detail" onClick={() => handleViewDetail(product.id)}>
                      Xem Chi Tiết
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>Không có sản phẩm nào phù hợp với tìm kiếm.</p>
        )}
      </Row>
    </Container>
  );
};

export default Home;
