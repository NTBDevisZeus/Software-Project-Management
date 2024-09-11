import { useContext, useEffect, useState } from "react";
import { Button, Container, Form, Image, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import APIs, { endpoints } from "../configs/APIs";
import { MyDispatchContext, MyUserContext } from "../App";

const Header = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    
    const [categories, setCategories] = useState([]);
    const [q, setQ] = useState("");
    const nav = useNavigate();

    const loadCates = async () => {
        let res = await APIs.get(endpoints['category']);
        setCategories(res.data);
    }

    useEffect(() => {
        loadCates();
    }, []);

    const search = (e) => {
        e.preventDefault();
        nav(`/?kw=${q}`);
    }

    return (<>
       
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="#home">E-commerce Website</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                   
                    <Link to="/" className="nav-link">Trang chủ</Link>
                
                    <NavDropdown title="Danh mục" id="basic-nav-dropdown">
                        {categories.map(c => {
                            const url = `/?cateId=${c.id}`
                            return <Link className="dropdown-item" key={c.id} to={url}>{c.name}</Link>;
                        })}
                    </NavDropdown>

                    {user===null?<>
                        <Link to="/login" className="nav-link text-danger">Đăng nhập</Link>
                        <Link to="/register" className="nav-link text-primary">Đăng ký</Link>
                    </>:<>
                        <Link to="/" className="nav-link text-danger">
                            <Image width={40} src={user.avatar} roundedCircle />
                            Chào {user.username}!</Link>
                        <Button className="btn btn-danger" onClick={() => dispatch({"type": "logout"})}>Đăng xuất</Button>
                    </>}
                    
                    
                    
                </Nav>
                <Form onSubmit={search} className="d-flex">
                    <Form.Control
                    type="search"
                    placeholder="Tìm sản phẩm..."
                    className="me-2"
                    aria-label="Search"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    />
                    <Button type="submit" variant="outline-success">Tìm</Button>
                </Form>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </>);
}

export default Header;