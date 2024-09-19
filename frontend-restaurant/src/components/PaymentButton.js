import React, { useContext, useState } from 'react';
import axios from 'axios';
import cookie from "react-cookies";
import APIs, { endpoints } from "../configs/APIs";
import { MyCartContext } from '../App';
const PaymentButton = ({ amount }) => {
  const [paymentUrl, setPaymentUrl] = useState(""); // Lưu URL thanh toán
  const [, dispatch] = useContext(MyCartContext);
    const [cart, setCart] = useState(cookie.load("cart") || {});
  const handlePayment = async () => {
    try {
      // Gọi API đến backend Django để lấy URL thanh toán
    //   const amount  = 1;
      const response = await APIs.get(endpoints['vnpay'], {
        params: { amount }
      });

      const paymentUrl = response.data.payment_url;
      console.log('Payment URL:', paymentUrl); // Kiểm tra URL trả về trong console



      if (paymentUrl && response.status===200 ) {
        // Chuyển hướng đến URL thanh toán của VNPay
        window.location.href = paymentUrl;
        setCart({}); // Reset giỏ hàng
        cookie.remove("cart"); // Xóa giỏ hàng khỏi cookies
        dispatch({ type: "paid" });

      } else {
        console.error('No payment URL received');
      }
    } catch (error) {
      console.error('Error during payment:', error); // Xử lý lỗi nếu có
    }
  };

  return (
    <div>
      <button onClick={handlePayment}>
        Thanh Toán VNPay
      </button>
    </div>
  );
};

export default PaymentButton;
