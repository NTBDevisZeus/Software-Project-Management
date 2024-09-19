import axios from "axios";
import cookie from "react-cookies";
export const BASE_URL = "http://127.0.0.1:8000/";

export const endpoints = {
    "category" : "/category/",
    "products": "/products/",
    "login": "/o/token/",
    "currentUser": "/users/current-user/", 
    "register": "/users/",
    "productcate":"/products/cate/${categoryId}/",
    "booking" : "/reservations/",
    "feedback" : "/feedbacks/",
    "table" : "/tables/",
    "pay": "/pay/",
    "order":"/orders/",
    "paymentVNpay": "/payments/",
    "vnpay" : "/vnpay/"

}

export const authAPIs = () => {
    const token = cookie.load('token');
    return axios.create({
        baseURL: BASE_URL,
        headers: {
           'Authorization': `Bearer ${token}`
        }
    })
}

export default axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});