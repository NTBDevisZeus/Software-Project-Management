
import { BrowserRouter, Routes ,Route} from 'react-router-dom';

import Home from './components/Home';
import RegisterForm from './components/Log/RegisterForm';
import ProductList from './components/Product/ProductList';
import MyUserReducer from './reducers/MyUserReducer';
import cookie, { load } from "react-cookies";
import Footer from './layout/Footer';
import Header from './layout/Header';
import { createContext, useReducer } from "react";
import { Container } from 'react-bootstrap';
import Login from './components/Login';

export const MyUserContext = createContext();
export const MyDispatchContext = createContext();
const App = () => {

  const [user, dispatch] = useReducer(MyUserReducer, load("user") || null);
  
  return (

    <BrowserRouter>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch} >
          <Header />

          <Container>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/products" element={<ProductList />} />

          </Routes>
          </Container>
          <Footer />
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
