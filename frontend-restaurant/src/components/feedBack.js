import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Image,
  Table,
  Row,
  Col,
} from "react-bootstrap";
import { authAPIs, endpoints } from "../configs/APIs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as emptyStar, faStarHalfAlt as halfStar } from "@fortawesome/free-solid-svg-icons";
import { MyUserContext } from "../App";
import { useNavigate } from "react-router";
const DEFAULT_IMAGE = "https://via.placeholder.com/300";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(1);
  const [image, setImage] = useState([]);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState([]);
  const [products, setProducts] = useState({});
  const user = useContext(MyUserContext);
  const navigate = useNavigate();

  const renderStar = (rating) => {
    const stars = [];
    for (let i = 1; i <= rating; i++) {
      if (rating >= i) {
        stars.push(faStarSolid);
      } else if (rating >= i - 0.5) {
        stars.push(halfStar);
      } else {
        stars.push(emptyStar);
      }
    }
    return stars.map((star, index) => (
      <FontAwesomeIcon key={index} icon={star} color="#FFD700" size="lg" />
    ));
  };

  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <FontAwesomeIcon
          key={starValue}
          icon={starValue <= rating ? faStarSolid : faStarRegular}
          onClick={() => handleStarClick(starValue)}
          style={{ cursor: "pointer", color: "#ffd700", fontSize: "2rem" }}
        />
      );
    });
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleAvatarChange = (e) => {
    setImage(e.target.files[0]);
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await authAPIs().get(endpoints["feedback"]);
      console.log(res.data)
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Lỗi khi tải feedbacks:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await authAPIs().get(`${endpoints["order"]}`);
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
    }
  };

  const fetchOrder = async () => {
    try {
      const res = await authAPIs().get(`${endpoints["order"]}`);
      const userOrders = res.data.filter(
        (order) => order.user === user.id && order.status === true
      );
      setOrder(userOrders);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await authAPIs().get(endpoints["products"]);
      const productMap = res.data.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {});
      setProducts(productMap);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchOrder();
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (ord) => {
    if (!user) {
      setError("Bạn cần đăng nhập để đánh giá.");
      setTimeout(() => {
        setError(null);
        navigate("/login");
      }, 2000);
      return;
    }

    const reso = await authAPIs().patch(`${endpoints["order"]}${ord.id}/`, {
      status: false, // Cập nhật trạng thái đơn hàng
    });
    if (reso.status === 200) {
      console.log("Trạng thái đơn hàng đã được cập nhật.");
    } else {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", reso);
    }

    const formData = new FormData();
    formData.append("user", user.id);
    formData.append("content", content);
    formData.append("rate", rating);
    formData.append("order_id", ord.id);
    if (image) {
      formData.append("fb_image", image);
    }

    try {
      await authAPIs().post(endpoints["feedback"], formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchFeedbacks();
      setContent("");
      setRating(1);
      setImage(null);
      window.location.reload();
    } catch (err) {
      console.error("Lỗi khi gửi feedback:", err);
    }
  };

  return (
    <Container className="mt-5 mb-5">
      {error && <Alert variant="danger">{error}</Alert>}
      <h2 className="mb-4">Danh sách đánh giá</h2>
      {feedbacks.length > 0 ? (
        feedbacks.map((feedback) => {
          const relatedOrder = orders.find((ord) => ord.id === feedback.order_id);
          return (
            <Card key={feedback.id} className="mt-4 mb-4">
              <Card.Header>
                <strong>Tên người dùng:</strong> {feedback.user.first_name} {feedback.user.last_name} 
              </Card.Header>
              <Card.Body>
                <div className="mb-2">{renderStar(feedback.rate)}</div>
                <p><strong>Nội dung:</strong> {feedback.content}</p>
                {feedback.fb_image && (
                  <img
                    src={feedback.fb_image}
                    alt="Feedback"
                    className="img-fluid mt-3"
                    style={{
                      maxWidth: "150px",
                      maxHeight: "150px",
                      objectFit: "cover",
                    }}
                  />
                )}
                {relatedOrder && (
                  <>
                    <h5 className="mt-3">Chi tiết đơn hàng:</h5>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Tên sản phẩm</th>
                          <th>Giá</th>
                          <th>Hình ảnh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatedOrder.order_details.map((detail) => {
                          const product = products[detail.product];
                          return (
                            <tr key={detail.id}>
                              <td>{product ? product.name : "Sản phẩm không tồn tại"}</td>
                              <td>{product ? product.price : "N/A"} VND</td>
                              <td>
                                {product && product.pr_image ? (
                                  <Image width={50} src={`https://res.cloudinary.com/dvxmxdhbj/${product.pr_image}`} />
                                ) : (
                                  "N/A"
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </>
                )}
              </Card.Body>
            </Card>
          );
        })
      ) : (
        <Alert variant="info">Chưa có đánh giá nào.</Alert>
      )}
      <h2 className="mt-5 mb-4">Gửi đánh giá của bạn</h2>
      {order.length > 0 ? (
        order.filter(ord => ord.status).map((ord) => (
          <Card key={ord.id} className="mb-4">
            <Card.Header>
              <h4>Đơn hàng ID: {ord.id}</h4>
            </Card.Header>
            <Card.Body>
              <h5 className="mt-3">Chi tiết đơn hàng:</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Hình ảnh</th>
                  </tr>
                </thead>
                <tbody>
                  {ord.order_details.map((detail) => {
                    const product = products[detail.product];
                    return (
                      <tr key={detail.id}>
                        <td>{product ? product.name : "Sản phẩm không tồn tại"}</td>
                        <td>{product ? product.price : "N/A"} VND</td>
                        <td>{detail.quantity}</td>
                        <td>
                          {product && product.pr_image ? (
                            <Image width={50} src={`https://res.cloudinary.com/dvxmxdhbj/${product.pr_image}`} />
                          ) : (
                            "N/A"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              <h5 className="mt-4">Gửi đánh giá của bạn</h5>
              <Form>
                <Form.Group controlId="feedbackContent">
                  <Form.Label>Nội dung</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="rating">
                  <Form.Label>Chọn số sao</Form.Label>
                  <div>{renderStars()}</div>
                </Form.Group>
                <Form.Group controlId="feedbackImage">
                  <Form.Label>Chọn ảnh</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  className="mt-3"
                  onClick={() => handleSubmit(ord)}
                >
                  Gửi đánh giá
                </Button>
              </Form>
            </Card.Body>
          </Card>
        ))
      ) : (
        <Alert variant="info">Bạn không có đơn hàng nào để đánh giá.</Alert>
      )}
    </Container>
  );
};

export default Feedback;
