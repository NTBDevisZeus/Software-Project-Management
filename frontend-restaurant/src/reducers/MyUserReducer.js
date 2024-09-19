import cookie from "react-cookies";
const MyUserReducer = (currentState, action) => {
  switch (action.type) {
    case "login":
      return action.payload;
    case "logout":
      cookie.remove("token");
      cookie.remove("user");
      return null;
    case "UPDATE_USER":
      return {
        ...currentState,
        ...action.payload, // Cập nhật thông tin người dùng mới
      };
  }

  return currentState;
};

export default MyUserReducer;