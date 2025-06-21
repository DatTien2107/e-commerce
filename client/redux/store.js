import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./features-auth/userReducer";
import { productReducer } from "./product/productReducer";

export default configureStore({
  reducer: {
    user: userReducer,
    product: productReducer,
  },
});

// HOST
export const server = "http://192.168.1.7:8080/api/v1";
// export const server = "http://10.87.53.114:8080/api/v1";
