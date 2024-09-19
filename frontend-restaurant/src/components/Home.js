import { useContext, useEffect, useState } from "react";
import APIs, { endpoints } from "../configs/APIs";
import cookie from 'react-cookies';
import { MyCartContext, MyCategoryContext, MySearchContext } from "../App";
import './Style/home.css'; // Import file CSS tuỳ chỉnh
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner, Container, Row, Col, Card, Button, Form, InputGroup, Collapse } from "react-bootstrap";

const Home = () => {
  const [products, setProducts] = useState([]); // State để lưu tất cả sản phẩm
  const [filteredProducts, setFilteredProducts] = useState([]); // State để lưu sản phẩm sau khi lọc
  const [loading, setLoading] = useState(true); // State để quản lý trạng thái loading
  const [, dispatch] = useContext(MyCartContext);
  const { searchTerm } = useContext(MySearchContext); // SearchContext để tìm kiếm
  const navigate = useNavigate();
  const location = useLocation();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("Mặc định");
  const [showFilters, setShowFilters] = useState(false);
  const { selectedCategory } = useContext(MyCategoryContext); 
 

  
  // Hàm tải danh sách sản phẩm từ API
  const loadProducts = async () => {
    try {
      let res = await APIs.get(endpoints['products']);
      if (res && res.data) {
        setProducts(res.data); // Lưu tất cả sản phẩm
        setFilteredProducts(res.data); // Ban đầu hiển thị tất cả sản phẩm
      }
      setLoading(false); // Dừng trạng thái loading
    } catch (error) {
      console.error("Error fetching products: ", error);
      setLoading(false); // Dừng trạng thái loading nếu có lỗi
    }
  };

  // Gọi API để tải sản phẩm khi component được mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Lọc sản phẩm theo từ khoá tìm kiếm
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory) {
        filtered = filtered.filter(product => product.category_id === selectedCategory); 
        console.log("Sản phẩm sau khi lọc theo danh mục:", filtered); 
    }

    if (searchTerm) {
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    setFilteredProducts(filtered);
}, [searchTerm, selectedCategory, products]);
  // Hàm thêm sản phẩm vào giỏ hàng
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

  

  // Hàm xem chi tiết sản phẩm
  const handleViewDetail = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Hàm áp dụng bộ lọc và sắp xếp
  const applyFilterAndSort = () => {
    let filtered = [...products];

    if (minPrice) {
      filtered = filtered.filter(product => product.price >= minPrice);
    }
    if (maxPrice) {
      filtered = filtered.filter(product => product.price <= maxPrice);
    }

    // Sắp xếp sản phẩm dựa theo tuỳ chọn sắp xếp
    if (sortOption === 'priceAsc') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'priceDesc') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rateAsc') {
      filtered = filtered.sort((a, b) => a.rate - b.rate);
    } else if (sortOption === 'rateDesc') {
      filtered = filtered.sort((a, b) => b.rate - a.rate);
    }

    setFilteredProducts(filtered);
  };
  const resetfilter =()=>{

    setMinPrice("");
    setMaxPrice("");
    setSortOption("Mặc định");

    setFilteredProducts(products);


  }

  // Hiển thị loading spinner nếu dữ liệu đang được tải
  if (loading) {
    return <Spinner animation="grow" variant="primary" />;
  }

  return (
    <Container className="mt-4">
      <h1 className="text-center text-primary mb-4">Danh Sách Sản phẩm</h1>
      <Row className="mb-4">
        <Col className="text-end">
          <Button
            variant="primary"
            onClick={() => setShowFilters(!showFilters)}
            aria-controls="example-collapse-text"
            aria-expanded={showFilters}
            className="filter-button"
          >
            Lọc & Sắp xếp
          </Button>
        </Col>
      </Row>

      <Collapse in={showFilters}>
        <div id="example-collapse-text">
          <Row className="justify-content-end mb-4">
            <Col md="auto">
              <InputGroup>
                <InputGroup.Text>Mức giá</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="Mức giá từ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  step="10000"
                />
                <InputGroup.Text>-</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="Mức giá đến"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  step="10000"
                />
              </InputGroup>
            </Col>

            <Col md="auto">
              <Form.Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="Mặc định">Mặc định</option>
                <option value="priceAsc">Giá tăng dần</option>
                <option value="priceDesc">Giá giảm dần</option>
                <option value="rateAsc">Đánh giá tăng dần</option>
                <option value="rateDesc">Đánh giá giảm dần</option>
              </Form.Select>
            </Col>

            <Col md="auto">
              <Button variant="primary" onClick={applyFilterAndSort}>
                <i className="fas fa-filter"></i> Áp dụng
              </Button>
            </Col>
            <Col md="auto">
              <Button variant="primary" onClick={resetfilter}>
                <i className="fas fa-filter"></i> Reset
              </Button>
            </Col>
          </Row>
        </div>
      </Collapse>

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
