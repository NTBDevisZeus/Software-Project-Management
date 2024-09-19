import React, { useState, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { MyDispatchContext, MyUserContext } from '../App';
import { authAPIs, endpoints } from '../configs/APIs'; // Giả sử bạn có sẵn API để cập nhật

const DEFAULT_IMAGE = "https://via.placeholder.com/100"; // Đường dẫn hình ảnh mặc định

const Profile = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const avatarSrc = user.avatar || DEFAULT_IMAGE;

  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone_number: user.phone_number,
    avatar: null, // Avatar mới sẽ được lưu ở đây nếu có thay đổi
  });

  // Xử lý ảnh được chọn
  const handleImageChange = (e) => {
    setUpdatedUser({
      ...updatedUser,
      avatar: e.target.files[0] // Lấy file ảnh từ input
    });
  };

  // Hàm xử lý sự thay đổi thông tin người dùng
  const handleChange = (e) => {
    setUpdatedUser({
      ...updatedUser,
      [e.target.name]: e.target.value
    });
  };

  // Hàm để gửi thông tin cập nhật
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('first_name', updatedUser.first_name);
      formData.append('last_name', updatedUser.last_name);
      formData.append('email', updatedUser.email);
      formData.append('phone_number', updatedUser.phone_number);

      // Nếu người dùng thay đổi ảnh thì thêm vào formData
      if (updatedUser.avatar) {
        formData.append('avatar', updatedUser.avatar);
      }

      // Gọi API để cập nhật thông tin
      const res = await authAPIs().patch(endpoints['currentUser'], formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Cập nhật ngữ cảnh người dùng sau khi cập nhật thành công
      dispatch({
        type: 'UPDATE_USER',
        payload: res.data, // Cập nhật thông tin người dùng trong ngữ cảnh
      });

      setIsEditing(false); // Thoát khỏi chế độ chỉnh sửa
    } catch (err) {
      console.error('Lỗi khi cập nhật thông tin:', err);
    }
  };

  return (
    <Container>
      <h1>Thông Tin Cá Nhân</h1>
      <Row className="profile-container">
        <Col md={4} className="profile-card">
          <Card className="mb-3">
            <Card.Img
              variant="top"
              src={avatarSrc}
              alt="Avatar"
              style={{ height: 'auto' }}
            />
            {isEditing && (
              <Form.Group className="mt-3">
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Form.Group>
            )}
          </Card>
        </Col>
        <Col md={8} className="profile-card">
          <Card className="mb-3">
            <Card.Body>
              {isEditing ? (
                <Form>
                  <Form.Group controlId="firstName">
                    <Form.Label>Họ</Form.Label>
                    <Form.Control
                      type="text"
                      name="first_name"
                      value={updatedUser.first_name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="lastName">
                    <Form.Label>Tên</Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      value={updatedUser.last_name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={updatedUser.email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="phoneNumber">
                    <Form.Label>Số Điện Thoại</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone_number"
                      value={updatedUser.phone_number}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Button variant="primary" onClick={handleSave} className='mt-3'>
                    Lưu
                  </Button>
                  <Button variant="secondary" onClick={() => setIsEditing(false)} className='mt-3'>
                    Hủy
                  </Button>
                </Form>
              ) : (
                <>
                  <Card.Title>Họ và tên: {user.first_name} {user.last_name}</Card.Title>
                  <Card.Text>
                    <strong>Email:</strong> {user.email}
                  </Card.Text>
                  <Card.Text>
                    <strong>Số Điện Thoại:</strong> {user.phone_number}
                  </Card.Text>
                  <Button variant="primary" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
