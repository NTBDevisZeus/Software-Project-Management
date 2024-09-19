import { useContext, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { MyCartContext } from "../App";

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cart, dispatch] = useContext(MyCartContext);
  const [loading, setLoading] = useState(false);

  const handlePaymentChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (paymentMethod === 'momo') {
      if (Object.keys(cart).length === 0) {
        alert("Giỏ hàng trống. Không thể thanh toán.");
        return;
      }

      setLoading(true);
      try {
        // Gửi yêu cầu thanh toán đến backend với path 'payUrl'
        const response = await fetch('/payUrl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: cart.totalAmount, // Tổng giá trị giỏ hàng
            cart_items: Object.values(cart.items) // Chi tiết giỏ hàng
          }),
        });

        const result = await response.json();
        setLoading(false);

        if (response.ok) {
          window.location.href = result.payUrl; // Chuyển hướng đến MoMo
        } else {
          alert(result.error || 'Failed to initiate payment');
        }
      } catch (error) {
        setLoading(false);
        alert('Error during payment process');
      }
    } else {
      alert(`Payment method selected: ${paymentMethod}`);
    }
  };

  return (
    <div className="container mt-4">
      <h4>Vui lòng chọn hình thức thanh toán:</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>
            <input
              type="radio"
              name="payment"
              value="zalopay"
              checked={paymentMethod === 'zalopay'}
              onChange={handlePaymentChange}
            />
            Ví ZaloPay <img src="/images/logo-zalopay.svg" alt="ZaloPay" />
          </label>
        </div>
        <div className="mb-3">
          <label>
            <input
              type="radio"
              name="payment"
              value="visa"
              checked={paymentMethod === 'visa'}
              onChange={handlePaymentChange}
            />
            Visa, Mastercard, JCB <span className="txtGray">(ZaloPay)</span>
          </label>
        </div>
        <div className="mb-3">
          <label>
            <input
              type="radio"
              name="payment"
              value="momo"
              checked={paymentMethod === 'momo'}
              onChange={handlePaymentChange}
            />
            MoMo Wallet <img src="/images/image.png" alt="MoMo" />
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
        </button>
      </form>
    </div>
  );
};

export default Payment;
