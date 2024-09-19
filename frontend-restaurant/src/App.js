
import { BrowserRouter, Routes ,Route} from 'react-router-dom';

import Home from './components/Home';
import RegisterForm from './components/Log/RegisterForm';
import LoginForm from './components/Log/LoginForm';
import ProductList from './components/Product/ProductList';
import MyUserReducer from './reducers/MyUserReducer';
import cookie, { load } from "react-cookies";
import Footer from './layout/Footer';
import Header from './layout/Header';
import { createContext, useReducer, useState } from "react";
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyCartReducer from './reducers/MyCartReducer';
import Cart from './components/Cart';
import ProductDetail from './components/Product/ProductDetail';
import CategoryProducts from './components/Product/CategoryProducts';

import Booking from './components/Booking';
import Profile from './components/Profile';
import Payment from './components/Payment';
import MomoSuccess from './components/MomoSuccess';
import Feedback from './components/feedBack';
import PaymentButton from './components/PaymentButton';
import PaymentReturn from './components/PaymentReturn';





export const MyCategoryContext = createContext();
export const MyUserContext = createContext();
export const MyDispatchContext = createContext();
export const MyCartContext = createContext();
export const MySearchContext = createContext();

const count = () => {
  let cart = cookie.load("cart") || null;
  if (cart !== null) {
      let totalQuantity = 0;
      for (let c of Object.values(cart))
          totalQuantity += c.quantity;

      return totalQuantity;
  }
  return 0;
}

const App = () => {

  const [user, dispatch] = useReducer(MyUserReducer, load("user") || null);
  const [cartCounter, cartDispatch] = useReducer(MyCartReducer, count());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  return (

    <BrowserRouter>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch} >
        <MyCartContext.Provider value={[cartCounter, cartDispatch]}>
        <MySearchContext.Provider value={{ searchTerm, setSearchTerm }}>
        <MyCategoryContext.Provider value={{ selectedCategory, setSelectedCategory }}>
          <Header />

          <Container>
          <Routes>
            <Route path="/login" element={<LoginForm/>} />
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/categories/:categoryId" element={<CategoryProducts />} /> 
            <Route path="/products/:productId" element={<ProductDetail />} />
            <Route path="/search" element={<ProductList />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/momo-success" element={<MomoSuccess />} />
            <Route path="/paymentVNpay" element={<PaymentButton />} />
            <Route path="/Payment_return" element={<PaymentReturn />} />
            
          </Routes>
          </Container>
          <Footer />
          </MyCategoryContext.Provider>
          </MySearchContext.Provider>
          </MyCartContext.Provider>
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
