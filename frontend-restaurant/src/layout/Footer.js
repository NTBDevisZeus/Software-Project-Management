import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import backgroundImage from '../components/images/background.jpg'; 

const Footer = () => {
  return (
    <footer
    style={{

      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
    
    
    className="bg-dark text-white py-4" >
      <Container>
        <Row>
          <Col md={3}>
            <h5>Nhà Hàng 4TML</h5>
            <p>Nhà hàng chúng tôi cung cấp nhưng món ăn đẳng cấp và luôn phục vụ khách hàng hết mình.</p>
          </Col>
          <Col md={3}>
            <h5>Mạng xã hội</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-white">FaceBook</Link></li>
              <li><Link to="/courses" className="text-white">TikTok</Link></li>
              <li><Link to="/about" className="text-white">GGmap</Link></li>
              <li><Link to="/contact" className="text-white">Zalo</Link></li>
            </ul>
          </Col>
          <Col md={3}>
            <h5>Liên Hệ</h5>
            <p>
              <i className="fa fa-phone"></i> Điện thoại: (0123) 456-789<br/>
              <i className="fa fa-envelope"></i> Email: info@example.com
            </p>
          </Col>
          <Col md={3}>
            <h5>Liên Hệ</h5>
            <p>
              <i className="fa fa-map-marker"></i> Địa chỉ 1: 123 Đường ABC, Thành phố XYZ<br/>
              <i className="fa fa-phone"></i> Địa chỉ 2: 123 Đường ABC, Thành phố XYZ<br/>
              <i className="fa fa-envelope"></i> Địa chỉ 3: 123 Đường ABC, Thành phố XYZ
            </p>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="text-center">
            <p>&copy; 2024 OnlineCourse. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;