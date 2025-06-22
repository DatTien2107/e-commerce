import colors from "colors";
import morgan from "morgan";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
//routes import
import testRoutes from "./routes/testRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import claudinary from "cloudinary";
// import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";
//dot env config
dotenv.config();

//database connection
connectDB();

//stripe configuration
export const stripe = new Stripe(process.env.STRIPE_API_SECRET);

//cloudinary
claudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// app.use(express.json());
//test
const app = express();

//middlewares
// app.use(helmet());
// app.use(mongoSanitize());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// route
app.use("/api/v1", testRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/cat", categoryRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/cart", cartRoutes);

app.get("/", (req, res) => {
  return res.status(200).send("<h1> welcome node server<h1/>");
});

//port
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
  console.log(`server running on port ${process.env.PORT}`.bgCyan.white);
});
