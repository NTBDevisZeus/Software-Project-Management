import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MomoSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const partnerCode = params.get('partnerCode');
        const orderId = params.get('orderId');
        const amount = params.get('amount');
        const resultCode = params.get('resultCode');
        const transactionId = params.get('transId');

        // Xử lý thông tin thanh toán nếu cần
        if (resultCode === '0') {
            console.log("Payment Successful!");
            console.log(`Order ID: ${orderId}, Amount: ${amount}`);
            
            // Gọi API để lưu thông tin thanh toán
            fetch('http://localhost:8000/api/momo-success/', {  // Thay đổi đường dẫn API theo nhu cầu
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    partnerCode,
                    orderId,
                    amount,
                    transactionId,
                    resultCode,
                }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Payment data saved:', data);
            })
            .catch(error => {
                console.error('Error saving payment data:', error);
            });
        } else {
            
            navigate('/'); // Quay lại trang chính nếu thanh toán thất bại
        }
    }, [location, navigate]);

    return (
        <div className="text-center mt-5">
            <h1>Thanh Toán Thành Công</h1>
            <p>Cảm ơn bạn đã thanh toán qua MoMo!</p>
            <p>Thông tin đơn hàng:</p>
            <ul>
                <li>Partner Code: {new URLSearchParams(location.search).get('partnerCode')}</li>
                <li>Order ID: {new URLSearchParams(location.search).get('orderId')}</li>
                <li>Amount: {new URLSearchParams(location.search).get('amount')} VND</li>
            </ul>
            <p>Vui lòng kiểm tra email để nhận hóa đơn.</p>
        </div>
    );
};

export default MomoSuccess;
