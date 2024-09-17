import { useContext, useState } from "react";
import { Button, Form } from "react-bootstrap";
import cookie from "react-cookies";
import { Navigate, useNavigate } from "react-router-dom"; // Ensure proper navigation
import { MyDispatchContext, MyUserContext } from "../App";
import APIs, { authAPIs, endpoints } from "../configs/APIs";

const Login = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null); // State to handle error messages
    const navigate = useNavigate(); // For navigation after login

    const login = async (e) => {
        e.preventDefault();

        try {
            // OAuth2 token request (password grant type)
            let res = await APIs.post(endpoints['login'], {
                "grant_type": "password",
                "client_id": "X0krpG85JYNi3nnLzunU7699TRChJqhoU5phvqQ6",
                "client_secret": "1uh5kSJIkjLZLu2gGhfzT6YhaFCfkAAT7yzHUiK90ayJC6DZeuGIYCTR5ejSkdtxXbOFM5ie2kGaD7nhfqfjj7ITsURXC1rZvehSFL58U7IDbhqsTVzKDDYyktEooRsP",
                "username": username,
                "password": password
            });

            // Save the access token in cookies
            cookie.save("token", res.data.access_token);

            // Fetch the current user after login using the token
            let userRes = await authAPIs().get(endpoints['currentUser']);
            console.info(userRes.data);

            // Save user data in cookies
            cookie.save("user", userRes.data);

            // Dispatch login action
            dispatch({
                "type": "login",
                "payload": userRes.data
            });

            // Redirect to home after successful login
            navigate("/");

        } catch (err) {
            console.error(err);
            setError("Login failed. Please check your username and password.");
        }
    }

    // If the user is already logged in, redirect to the homepage
    if (user !== null)
        return <Navigate to="/" />

    return (
        <>
            <h1 className="text-center text-primary mt-1">ĐĂNG NHẬP NGƯỜI DÙNG</h1>

            {error && <p className="text-danger">{error}</p>}

            <Form onSubmit={login} method="post">
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Tên đăng nhập</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Tên đăng nhập..."
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Mật khẩu..."
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
                    <Button type="submit" variant="info">Đăng nhập</Button>
                </Form.Group>
            </Form>
        </>
    );
}

export default Login;
