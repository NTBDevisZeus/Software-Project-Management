import { useContext, useState } from "react";
import { Alert, Button, Table } from "react-bootstrap";
import cookie from "react-cookies";
import { MyCartContext, MyUserContext } from "../App";
import { authAPIs, endpoints } from "../configs/APIs";

const Cart = () => {
    const user = useContext(MyUserContext);
    const [,dispatch] = useContext(MyCartContext);
    const [cart, setCart] = useState(cookie.load("cart") || null);

   const removeFromCart = (productId) => {
        if (cart !== null) {
            const updatedCart = { ...cart };
            delete updatedCart[productId]; // Remove the product from the cart
            setCart(updatedCart); // Update the cart state
            cookie.save("cart", updatedCart); // Save updated cart to cookies

            // Dispatch action to update total quantity in cart
            dispatch({ type: 'update' });
        }
    };

    const pay = async () => {
        if (cart !== null) {
            let res = await authAPIs().post(endpoints['pay'], Object.values(cart));
            if (res.status === 201) {
                setCart([]);
                cookie.remove("cart");
                dispatch({"type": "paid"});
            }
        }
    }

    return (
        <>
            <h1 className="text-center text-primary mt-1">GIỎ HÀNG</h1>

            {cart===null?<Alert variant="warning">Không có sản phẩm nào</Alert>:<>
                <Table striped bordered hover>
                    <tr>
                        <th>Id</th>
                        <th>Tên sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th></th>
                    </tr>
                    {Object.values(cart).map(c => <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.name}</td>
                        <td>{c.unitPrice}</td>
                        <td>{c.quantity}</td>
                        <td><Button variant="danger" onClick={() => removeFromCart(c.id)}>&times;</Button></td>
                    </tr>)}
                    
                </Table>
            </>}
        
        {user !== null && <Button onClick={pay} className="btn btn-info mb-1">Thanh toán</Button>}
           
        </>
    )
}

export default Cart;