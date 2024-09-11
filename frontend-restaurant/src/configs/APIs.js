import axios from "axios";
import cookie from "react-cookies";
const BASE_URL = "http://127.0.0.1:8000/";

export const endpoints = {
    "category" : "/category",
    "products": "/products",
    "login": "/o/token/",
    "currentUser": "/users/current-user/", 
    "register": "/users",
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