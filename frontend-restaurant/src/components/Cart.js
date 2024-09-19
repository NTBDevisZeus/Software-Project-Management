import { useContext, useState, useEffect } from "react";
import { Alert, Button, Table } from "react-bootstrap";
import cookie from "react-cookies";
import { MyCartContext, MyUserContext } from "../App";
import { authAPIs } from "../configs/APIs";
import { useNavigate } from "react-router-dom";
import PaymentButton from "./PaymentButton";

const Cart = () => {
    const user = useContext(MyUserContext);
    const [, dispatch] = useContext(MyCartContext);
    const [cart, setCart] = useState(cookie.load("cart") || {});
    const [totalAmount, setTotalAmount] = useState(0); // Thêm state để lưu tổng giá trị giỏ hàng
    const navigate = useNavigate();

    // Tính tổng giá trị giỏ hàng mỗi khi giỏ hàng thay đổi
    useEffect(() => {
        const calculateTotalAmount = () => {
            const total = Object.values(cart).reduce((acc, item) => {
                return acc + parseFloat(item.unitPrice) * item.quantity; // Đảm bảo tính toán chính xác
            }, 0);
            setTotalAmount(total); // Cập nhật tổng giá trị
        };

        calculateTotalAmount();
    }, [cart]);

    const removeFromCart = (productId) => {
        if (cart) {
            const updatedCart = { ...cart };
            delete updatedCart[productId]; // Xóa sản phẩm khỏi giỏ hàng
            setCart(updatedCart); // Cập nhật trạng thái giỏ hàng
            cookie.save("cart", updatedCart); // Lưu giỏ hàng đã cập nhật vào cookies

            // Dispatch action để cập nhật tổng số lượng trong giỏ hàng
            dispatch({ type: 'update' });
        }
    };

    const pay = async () => {
        if (Object.keys(cart).length === 0) {
            alert("Giỏ hàng của bạn đang trống.");
            return;
        }

        try {
            // Lưu giỏ hàng vào server
            const cartItems = Object.values(cart);
            console.log("Cart items:", cartItems); // Log giỏ hàng
            console.log("Total amount:", totalAmount); // Log tổng giá trị

            await authAPIs().post('/save-cart/', { cart_items: cartItems }); // Đảm bảo có dấu / ở cuối

            const res = await authAPIs().post('/payUrl', {
                amount: totalAmount, // Sử dụng totalAmount đã tính toán
                cart_items: cartItems
            });

            if (res.status === 200) {
                window.location.href = res.data.payUrl; // Chuyển hướng đến trang thanh toán MoMo
                setCart({}); // Reset giỏ hàng
                cookie.remove("cart"); // Xóa giỏ hàng khỏi cookies
                dispatch({ type: "paid" }); // Cập nhật trạng thái thanh toán
            } else {
                alert("Thanh toán không thành công. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.");
        }


        
    };
    const calculateTotalAmounts = () => {
        if (cart !== null) {
            return Object.values(cart).reduce((total, item) => {
                return total + (item.unitPrice * item.quantity);
            }, 0);
        }
        return 0;
    };
    const amounts = calculateTotalAmounts();

    return (
        <>
            <h1 className="text-center text-primary mt-1">Giỏ Hàng</h1>

            {Object.keys(cart).length === 0 ? (
                <Alert variant="warning">Không có sản phẩm nào trong giỏ hàng.</Alert>
            ) : (
                <>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên sản phẩm</th>
                                <th>Đơn giá</th>
                                <th>Số lượng</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(cart).map(c => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.name}</td>
                                    <td>{c.unitPrice.toLocaleString()} VND</td> {/* Định dạng đơn giá */}
                                    <td>{c.quantity}</td>
                                    <td>
                                        <Button variant="danger" onClick={() => removeFromCart(c.id)}>
                                            &times;
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* Hiển thị tổng giá trị giỏ hàng */}
                    <h4 className="text-right">Tổng giá trị: {totalAmount.toLocaleString()} VND</h4>

                    {user && (
                        <Button onClick={pay} className="btn btn-info mb-1">
                            Thanh toán 
                        </Button>
                        
                        
                    )}
                    <PaymentButton amount={amounts} />
                </>
            )}
        </>
    );
};

export default Cart;
