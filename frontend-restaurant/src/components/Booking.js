import React, { useContext, useEffect, useState } from "react";
import { faCalendarAlt, faChair, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {Container,Form,Button,Alert,ToggleButton,ToggleButtonGroup,Card,} from "react-bootstrap";
import { MyUserContext } from "../App";
import { authAPIs, endpoints } from "../configs/APIs";
import { useNavigate } from "react-router";

const Booking = () => {
  const user = useContext(MyUserContext);
  const [date, setDate] = useState("");
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [ofusers, setOfusers] = useState([]);
  const [table,setTable] =  useState([]);
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState(5);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const test = async () => {
    try {
      let res = await authAPIs().get(endpoints["booking"]);
      // Lọc dữ liệu theo user.id
      const filteredData = res.data.filter(
        (booking) => booking.user === user.id
      );
      setOfusers(filteredData);
      console.log(filteredData)
    
    } catch (error) {
      
    }
  }

  const Table = async ()  => {
    try {
      let res = await authAPIs().get(endpoints['table']);
      console.log("thi", res.data);
      setTable(res.data);
    } catch (error) {
      
    }
  }
  useEffect(() => {
    test();
    Table();
  }, []);


  const fetchReservations = async () => {
    try {
      const res = await authAPIs().get(endpoints["booking"]);
      console.log(res.data)
      setReservations(res.data)
      const today = new Date();
      res.data.forEach((reservation) => {
        const reservationDate = new Date(reservation.date);
        if (today > reservationDate) {
          console.log(`Ngày đặt bàn đã qua: ${reservation.status} `);
          updateReservationStatus(reservation.id, reservation.status, reservation.date, reservation.use, reservation.table);
        }});
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu đặt bàn:", err);
    }
  };

  const updateReservationStatus = async (reservationID, status, date, user, table) => {
    try {
      await authAPIs().patch(`${endpoints["booking"]}/${reservationID}`,{
        date: `${date}`,
        status: 0,
        user: user,
        table: table});
    } catch (err) {
      setError("Không thể cập nhật trạng thái đặt bàn.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);



  const isTableBooked = (tableId) => {
    return reservations.some(
      (reservation) =>
        reservation.table === tableId && reservation.status === true
    );
  };

  const handleBooking = async () => {
    if (!user) {
      setError("Bạn cần đăng nhập để đặt bàn.");
      setTimeout(() => {
        setError(null);
        navigate("/login");
      }, 2000);
      return;
    }

    if (!date || !selectedTable) {
      setError("Vui lòng chọn bàn, ngày và giờ để đặt.");
      return;
    }

    // Kiểm tra xem ngày đã chọn có hợp lệ hay không
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Đặt giờ của ngày hiện tại về 0 để chỉ so sánh ngày

  if (selectedDate < today) {
    setError("Vui lòng chọn ngày hợp lệ (không phải ngày đã qua).");
    return;
  }

    try {
      await authAPIs().post(`${endpoints["booking"]}`, {
        date: `${date}`,
        status: 1,
        user: user.id,
        table: selectedTable,
      });
      alert("Đặt bàn thành công!");
      fetchReservations(); 
      navigate("/pay")
    } catch (err) {
      console.info(err.message);
      setError("Không thể đặt bàn. Vui lòng thử lại.");
    }
    setLoading(true);
  };

  const handleAddTable = async () => {
    try {
      await authAPIs().post(endpoints['table'],{
        name: tableName,
        capacity: capacity,
        is_active: 1
      });
      alert("Thêm thành công !")
      Table();
    } catch (error) {
      setError(" Thêm thất bại !")
    }
    
  }

  const handleTableSelect = (val) => {
    setSelectedTable(val);
  };

    // Hàm tìm tên bàn từ ID
    const getTableName = (tableId) => {
      const tb = table.find((table) => table.id === tableId);
      return tb ? tb.name : "Không xác định";
    };

  return (
    <Container className="mt-5">
      <h1>Đặt Bàn</h1>
      {ofusers.length > 0 ? (
        <ul>
          {ofusers.map((booking) => (
            <Card key = {booking.id} className="mt-5 mb-5">
            <Card.Header>Bàn : {getTableName(booking.table)}</Card.Header>
            <Card.Body>
              <blockquote className="blockquote mb-0">
                <p>Ngày: {booking.date}</p>
                <p>Trạng thái: {booking.status ? "Đã xác nhận" : "Đã hoàn thành"}</p>
              </blockquote>
            </Card.Body>
          </Card>
          ))}
        </ul>
      ) : (
        <p>Không có đặt bàn nào.</p>
      )}
      <Form>
        <h2>Danh sách bàn ăn</h2>
        <ToggleButtonGroup
          type="radio"
          name="tables"
          value={selectedTable}
          onChange={handleTableSelect}
          className="mb-3"
        >
          {table.map((table) => (
            <ToggleButton
              key={table.id}
              id={`table-${table.id}`}
              value={table.id}
              variant="outline-primary"
              //variant={isTableBooked(table.id) ? "dark" : "light"} 
              className={`table-card ${isTableBooked(table.id) ? "booked" : ""}`}
              disabled={isTableBooked(table.id)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <FontAwesomeIcon icon={faChair} size="2x" />
                <div className="ml-3">
                  <h5>Bàn {table.name}</h5>
                  <p>{table.capacity} chỗ</p>
                  {isTableBooked(table.id) ? (
                    <FontAwesomeIcon
                      icon={faTimesCircle}
                      color="#dc3545"
                      title="Đã đặt"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      color="#28a745"
                      title="Trống"
                    />
                  )}
                </div>
              </div>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
          {user && user.role === 1 && (
          <>
            <Button
              loading={loading}
              variant="success"
              className="mb-3"
              onClick={handleAddTable}
            >
              Thêm Bàn
            </Button>

            {/* Form thêm bàn */}
            <Form.Group controlId="tableName" className="mb-3">
              <Form.Label>Tên Bàn</Form.Label>
              <Form.Control
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Nhập tên bàn"
              />
            </Form.Group>

            <Form.Group controlId="Capacity" className="mb-3">
              <Form.Label>Số lượng</Form.Label>
              <Form.Control
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Nhập số lượng"
              />
            </Form.Group>
          </>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group controlId="date" className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
            Chọn Ngày
          </Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="border-primary"
          />
        </Form.Group>

        <Button variant="primary" size="lg" className="mt-3 mb-5 w-100" onClick={handleBooking} loading={loading}>
          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
          Đặt Bàn
        </Button>
      </Form>
    </Container>
  );
};

export default Booking;

const style = document.createElement("style");
style.textContent = `
  .table-card {
    flex-basis: calc(33.33% - 10px);
    margin: 5px;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid #ddd;
    transition: background-color 0.3s ease;
  }

  .table-card:hover {
    background-color: #f0f0f0;
  }

  .table-card.booked {
    background-color: #f8d7da;
    border-color: #f5c6cb;
  }

  .table-card:not(.booked) {
    background-color: #d4edda;
    border-color: #c3e6cb;
  }
`;
document.head.appendChild(style);