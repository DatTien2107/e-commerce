import express from "express";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

//dot env config
dotenv.config();

//test
const app = express();

//middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// route
app.get("/", (req, res) => {
  return res.status(200).send("<h1> welcome node server<h1/>");
});

//port
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
  console.log(`server running on port ${process.env.PORT}`.bgCyan.white);
});
