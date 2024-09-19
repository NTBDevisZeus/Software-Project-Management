import React, { useContext, useEffect, useState } from "react";
import { Badge, Button, Container, Form, Image, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import APIs, { endpoints } from "../configs/APIs";
import { MyDispatchContext, MyUserContext, MyCartContext, MySearchContext, MyCategoryContext } from "../App";
import backgroundImage from '../components/images/header.jpg';

const Header = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const [cartCounter] = useContext(MyCartContext);
    const { setSearchTerm } = useContext(MySearchContext);
    const [q, setQ] = useState("");
    const nav = useNavigate();
    const { setSelectedCategory } = useContext(MyCategoryContext);
    const [categories, setCategories] = useState([]);

    const loadCates = async () => {
        let res = await APIs.get(endpoints['category']);
        setCategories(res.data);
    };

    useEffect(() => {
        loadCates();
    }, []);

    const search = (e) => {
        e.preventDefault();
        setSearchTerm(q);
    };

    const handleCategorySelect = (cateId) => {
        setSelectedCategory(cateId);
        setSearchTerm("");
    };

    const handleLogout = () => {
        dispatch({ type: "logout" });
        nav("/");
    };

    return (
        <header 
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100px',
                display: 'flex',
                alignItems: 'center', // Center content vertically
                padding: '0 20px',
            }}
        >
            <Container fluid>
                <Navbar expand="lg" className="bg-transparent w-100">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>
                            Restaurant
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
                            <Nav className="me-auto align-items-center">
                                <Link to="/" className="nav-link text-white">Trang chủ</Link>
                                <NavDropdown title="Danh mục" id="basic-nav-dropdown" className="text-white">
                                    {categories.map(c => (
                                        <NavDropdown.Item key={c.id} onClick={() => handleCategorySelect(c.id)}>
                                            {c.name}
                                        </NavDropdown.Item>
                                    ))}
                                </NavDropdown>
                                {user === null ? (
                                    <>
                                        <Link to="/login" className="nav-link text-danger">Đăng nhập</Link>
                                        <Link to="/register" className="nav-link text-primary">Đăng ký</Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/profile" className="nav-link text-light d-flex align-items-center">
                                            <Image width={40} src={user.avatar} roundedCircle />
                                            <span className="ms-2">Chào {user.username}!</span>
                                        </Link>
                                        <Button className="btn btn-danger ms-3" onClick={handleLogout}>Đăng xuất</Button>
                                    </>
                                )}
                                <Link to="/feedback" className="nav-link text-danger">Feedback</Link>
                                <Link to="/booking" className="nav-link text-primary">Đặt Bàn</Link>
                                <Link to="/cart" className="nav-link text-light d-flex align-items-center">
                                    <i className="bi bi-cart-fill"></i>
                                    <Badge className="bg-danger ms-1">{cartCounter}</Badge>
                                </Link>
                            </Nav>
                            <Form onSubmit={search} className="d-flex align-items-center">
                                <Form.Control
                                    type="search"
                                    placeholder="Tìm sản phẩm..."
                                    className="me-2"
                                    aria-label="Search"
                                    value={q}
                                    onChange={e => setQ(e.target.value)}
                                    style={{ minWidth: '200px' }}
                                />
                                <Button type="submit" variant="outline-light">Tìm</Button>
                            </Form>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>
        </header>
    );
}

export default Header;
