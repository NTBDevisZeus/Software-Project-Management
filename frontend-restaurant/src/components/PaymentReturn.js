import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Sử dụng useNavigate thay vì useHistory

const PaymentReturn = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Sử dụng useNavigate thay vì useHistory
  const [paymentData, setPaymentData] = useState({
    amount: '',
    vnp_TransactionNo: '',
    vnp_ResponseCode: '',
    msg: ''
  });

  // Hàm để lấy các query parameters từ URL
  const getQueryParams = (search) => {
    return new URLSearchParams(search);
  };

  useEffect(() => {
    const queryParams = getQueryParams(location.search);

    setPaymentData({
      amount: queryParams.get('vnp_Amount'),
      vnp_TransactionNo: queryParams.get('vnp_TransactionNo'),
      vnp_ResponseCode: queryParams.get('vnp_ResponseCode'),
      msg: queryParams.get('msg') || ''
    });

    // Kiểm tra nếu URL chưa đúng (chỉ redirect khi URL không đúng)
    if (!location.search.includes('vnp_ResponseCode=00') && queryParams.get('vnp_ResponseCode') === '00') {
      // Sử dụng navigate để thay đổi URL mà không gây reload trang
      navigate(`/Payment_return/?vnp_Amount=${queryParams.get('vnp_Amount')}&vnp_TransactionNo=${queryParams.get('vnp_TransactionNo')}&vnp_ResponseCode=${queryParams.get('vnp_ResponseCode')}&msg=${queryParams.get('msg')}`, { replace: true });
    }
  }, [location.search, navigate]);

  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        Kết quả thanh toán: {paymentData.vnp_ResponseCode === '00' ? 'Thành công' : 'Lỗi'}
      </div>
      <div className="panel-body">
        <p>Amount: {Number(paymentData.amount) / 100} VND</p> {/* Chia cho 100 để lấy giá trị đúng */}
        <p>Transaction Number: {paymentData.vnp_TransactionNo}</p>
        {paymentData.vnp_ResponseCode === '00' ? (
          <p>Trạng thái: {paymentData.vnp_ResponseCode} - Thành công, cảm ơn quý khách.</p>
        ) : (
          <p>Trạng thái: {paymentData.vnp_ResponseCode} - Lỗi, vui lòng thử lại.</p>
        )}
        {paymentData.msg && <p className="alert-warning">{paymentData.msg}</p>}
      </div>
    </div>
  );
};

export default PaymentReturn;