import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./features-auth/userReducer";
import { productReducer } from "./product/productReducer";
import { categoryReducer } from "./category/categoryReducer";

export default configureStore({
  reducer: {
    user: userReducer,
    product: productReducer,
    category: categoryReducer,
  },
});

// HOST
export const server = "http://192.168.1.7:8080/api/v1";
// export const server = "http://10.87.53.114:8080/api/v1";
