import React, { useState, useEffect, useContext } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { authAPIs, endpoints } from "../configs/APIs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as emptyStar, faStarHalfAlt as halfStar } from "@fortawesome/free-solid-svg-icons";
import { MyUserContext } from "../App";
import { useNavigate } from "react-router";

const FeedBack = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(1);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const user = useContext(MyUserContext);
    const navigate = useNavigate();


  const handleAvatarChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Hàm lấy feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await authAPIs().get(endpoints["feedback"]); // Endpoint feedbacks
      console.log(res.data)
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Lỗi khi tải feedbacks:", err);
    }
  };

  // Hàm gửi feedback mới
  const handleSubmit = async () => {
    if (!user) {
        setError("Bạn cần đăng nhập để đánh giá.");
        setTimeout(() => {
          setError(null);
          navigate("/login");
        }, 2000);
        return;
    }
    const formData = new FormData();
    formData.append("ueser", user)
    formData.append("content", content);
    formData.append("rate", rating);
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
    } catch (err) {
      console.error("Lỗi khi gửi feedback:", err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Hàm để hiển thị sao
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
          style={{ cursor: 'pointer', color: '#ffd700', fontSize: '2rem' }}
        />
      );
    });
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  return (
    <Container className="mt-5 mb-5">
      {error && <Alert variant="danger">{error}</Alert>}
      <h2>Danh sách đánh giá</h2>
      {feedbacks.map((feedback) => (
        <Card key={feedback.id} className="mt-5 mb-5">
          <Card.Header>
            Tên người dùng: {feedback.user.username} {/* Hiển thị tên người dùng */}
          </Card.Header>
          <Card.Body>
            <div>{renderStar(feedback.rate)}</div> {/* Hiển thị sao của người dùng */}
            <p>Nội dung: {feedback.content}</p>
            {feedback.fb_image && (
              <img src={feedback.fb_image} alt="Feedback" className="img-fluid mt-3" 
              style={{ maxWidth: "150px", maxHeight: "150px", objectFit: "cover" }}/>
            )}
          </Card.Body>
        </Card>
      ))}
      <h2>Gửi đánh giá của bạn</h2>
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
          <div>{renderStars()}</div> {/* Ngôi sao cho người dùng chọn */}
        </Form.Group>
        <Form.Group controlId="feedbackImage">
          <Form.Label>Chọn ảnh</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </Form.Group>
        <Button variant="primary" className="mt-3" onClick={handleSubmit}>
          Gửi đánh giá
        </Button>
      </Form>
    </Container>
  );
};

export default FeedBack;

// const style = document.createElement("style");
// style.textContent = `
//   .dropzone {
//     border: 2px dashed #007bff;
//     border-radius: 4px;
//     padding: 20px;
//     text-align: center;
//     cursor: pointer;
//     margin-top: 10px;
//   }

//   .dropzone:hover {
//     background-color: #f0f8ff;
//   }
// `;
// document.head.appendChild(style);
